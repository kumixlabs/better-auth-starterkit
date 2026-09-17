#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { glob } from "glob";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Repo root (three levels up from packages/mcp/dist|src).
const REPO_ROOT = resolve(__dirname, "..", "..", "..");

/** The package this server knows intimately; other @kumix/* packages are indexed generically. */
const UI_PACKAGE = "@kumix/better-auth-ui";

const SCAN_IGNORE = ["**/node_modules/**", "**/dist/**"];

let SERVER_VERSION = "0.0.0";
try {
  const pkgJsonPath = resolve(__dirname, "..", "package.json");
  const pkgJson = JSON.parse(await readFile(pkgJsonPath, "utf-8"));
  if (typeof pkgJson.version === "string") SERVER_VERSION = pkgJson.version;
} catch {
  // keep default
}

interface ComponentEntry {
  name: string;
  package: string;
  /** Path relative to package `src/` (posix). */
  path: string;
  /** Consumer import specifier, e.g. `@kumix/better-auth-ui/sign-in`. */
  importPath: string;
  /**
   * Top-level `src/` segment: feature folder (`organization`, `two-factor`, `settings`, …),
   * `lib` (client plugins), `email` (react-email templates), or `views` for root-level files.
   */
  category: string;
}

interface PackageInfo {
  name: string;
  version: string;
  description: string;
  main: string;
  exports: string[];
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  srcDir: string | null;
  packageDir: string;
  componentFiles: string[];
  categories: Record<string, number>;
}

const packages = new Map<string, PackageInfo>();
/** Lowercase component basename → entries (may be multiple: views/passkey + api-key/passkey). */
const components = new Map<string, ComponentEntry[]>();

function categorize(relativePath: string): string {
  const p = relativePath.replace(/\\/g, "/");
  return p.includes("/") ? p.split("/")[0]! : "views";
}

/** Map `src/` relative path → published import specifier. */
function toImportPath(packageName: string, relativePath: string): string {
  // package.json exports: "./*" → dist/*, "./lib/*" → dist/lib/*
  const withoutExt = relativePath.replace(/\\/g, "/").replace(/\.(tsx?|jsx?|mjs|cjs)$/i, "");
  return `${packageName}/${withoutExt}`;
}

function matchesCategoryFilter(entry: ComponentEntry, filter: string): boolean {
  const f = filter.toLowerCase();
  if (entry.category.toLowerCase() === f) return true;
  if (entry.package.includes(filter)) return true;
  if (entry.path.toLowerCase().includes(f)) return true;
  return false;
}

class KumixUiMCPServer {
  private async loadPackageInfo(): Promise<void> {
    packages.clear();
    components.clear();

    try {
      const packageDirs = await glob("packages/**/package.json", {
        cwd: REPO_ROOT,
        windowsPathsNoEscape: true,
        ignore: SCAN_IGNORE,
      });

      for (const relativePackageDir of packageDirs.map((p) => dirname(p))) {
        const packageDir = resolve(REPO_ROOT, relativePackageDir);
        const packageJsonPath = join(packageDir, "package.json");

        try {
          await access(packageJsonPath);
          const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));

          if (!packageJson.name?.startsWith("@kumix/") || packageJson.name === "@kumix/mcp") {
            continue;
          }

          const srcDir = join(packageDir, "src");
          let componentFiles: string[] = [];
          let hasSrcDir = false;
          const categories: Record<string, number> = {};

          try {
            await access(srcDir);
            hasSrcDir = true;

            const relativeSrc = relative(REPO_ROOT, srcDir).replace(/\\/g, "/");
            const componentFileRel = await glob(`${relativeSrc}/**/*.{ts,tsx}`, {
              cwd: REPO_ROOT,
              windowsPathsNoEscape: true,
              ignore: [
                "**/*.test.ts",
                "**/*.test.tsx",
                "**/*.d.ts",
                "**/*.css.d.ts",
                ...SCAN_IGNORE,
              ],
            });
            componentFiles = componentFileRel.map((p) => resolve(REPO_ROOT, p));
          } catch (error) {
            console.error(`[mcp] no src/ in ${packageJson.name}:`, error);
            hasSrcDir = false;
          }

          const exportEntries = Object.keys(packageJson.exports || {})
            .filter((key) => key !== "./package.json")
            .map((key) => key.replace(/^\.\//, ""));

          if (hasSrcDir) {
            for (const componentFile of componentFiles) {
              const componentName = basename(componentFile, extname(componentFile));
              const relativePath = relative(srcDir, componentFile).replace(/\\/g, "/");
              const category = categorize(relativePath);
              categories[category] = (categories[category] ?? 0) + 1;

              const entry: ComponentEntry = {
                name: componentName,
                package: packageJson.name,
                path: relativePath,
                importPath: toImportPath(packageJson.name, relativePath),
                category,
              };

              const key = componentName.toLowerCase();
              const list = components.get(key) ?? [];
              list.push(entry);
              components.set(key, list);
            }
          }

          packages.set(packageJson.name, {
            name: packageJson.name,
            version: packageJson.version,
            description: packageJson.description,
            main: packageJson.main,
            exports: exportEntries,
            dependencies: packageJson.dependencies || {},
            peerDependencies: packageJson.peerDependencies || {},
            devDependencies: packageJson.devDependencies || {},
            srcDir: hasSrcDir ? srcDir : null,
            packageDir,
            componentFiles,
            categories,
          });
        } catch (error) {
          console.error(`[mcp] failed to read ${packageJsonPath}:`, error);
        }
      }
    } catch (error) {
      console.error("Error loading package info:", error);
    }
  }

  async listPackages() {
    if (packages.size === 0) {
      await this.loadPackageInfo();
    }

    const allPackages = Array.from(packages.values());

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              packages: allPackages.map((pkg) => ({
                name: pkg.name,
                version: pkg.version,
                description: pkg.description,
                exports: pkg.exports,
                categories: pkg.categories,
                componentCount: Object.values(pkg.categories).reduce((sum, n) => sum + n, 0),
              })),
              total: allPackages.length,
              notes: {
                [UI_PACKAGE]: {
                  views:
                    "Root-level auth views: auth (router view), sign-in, sign-up, sign-out, verify-email, forgot-password, reset-password, magic-link, reauthentication",
                  features:
                    "Feature folders: organization, settings, two-factor, passkey, api-key, admin, oauth-provider, multi-session, email-otp, siwe, anonymous, agent-auth, dash, billing, delete-user, device-authorization, last-login-method, username",
                  lib: "Client plugins: @kumix/better-auth-ui/lib/organization-plugin, lib/admin-plugin, lib/two-factor-plugin, …",
                  email:
                    "react-email templates: email/email-verification, email/reset-password, email/otp-email, email/organization-invitation, …",
                  imports:
                    "Per-file: @kumix/better-auth-ui/sign-in, @kumix/better-auth-ui/lib/organization-plugin, @kumix/better-auth-ui/email/email-verification",
                  styling:
                    "UI primitives come from @kumix/ui (e.g. import { Button } from '@kumix/ui/ui/button'); import '@kumix/better-auth-ui/css' for styles",
                  toast:
                    "Toast feedback uses @kumix/ui/custom/toast (toastSuccess/toastError) — render <ToastContainer /> once in the app",
                },
              },
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  async getPackageInfo(packageName: string) {
    if (packages.size === 0) {
      await this.loadPackageInfo();
    }

    const pkg = packages.get(packageName);
    if (!pkg) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                error: `Package ${packageName} not found`,
                availablePackages: Array.from(packages.keys()),
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    const { packageDir, srcDir, componentFiles, ...safeInfo } = pkg;

    const sampleImports =
      packageName === UI_PACKAGE
        ? {
            provider: 'import { AuthProvider } from "@kumix/better-auth-ui/auth-provider"',
            errorToaster: 'import { ErrorToaster } from "@kumix/better-auth-ui/error-toaster"',
            authView: 'import { Auth } from "@kumix/better-auth-ui/auth"',
            signIn: 'import { SignIn } from "@kumix/better-auth-ui/sign-in"',
            signUp: 'import { SignUp } from "@kumix/better-auth-ui/sign-up"',
            plugin:
              'import { organizationPlugin } from "@kumix/better-auth-ui/lib/organization-plugin"',
            email:
              'import { EmailVerification } from "@kumix/better-auth-ui/email/email-verification"',
            toast: 'import { ToastContainer, toastSuccess } from "@kumix/ui/custom/toast"',
            css: 'import "@kumix/better-auth-ui/css";',
            docs: {
              betterAuth: "https://www.better-auth.com",
              betterAuthUi: "https://github.com/better-auth-ui/better-auth-ui",
              kumixUi: "https://www.npmjs.com/package/@kumix/ui",
            },
          }
        : undefined;

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              ...safeInfo,
              sampleImports,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  async findComponent(componentName: string, packageFilter?: string) {
    if (packages.size === 0) {
      await this.loadPackageInfo();
    }

    const query = componentName.toLowerCase();
    let matching: ComponentEntry[] = [];

    for (const [name, entries] of components) {
      if (name.includes(query)) {
        matching.push(...entries);
      } else {
        for (const entry of entries) {
          if (entry.path.toLowerCase().includes(query)) {
            matching.push(entry);
          }
        }
      }
    }

    // de-dupe by package+path
    const seen = new Set<string>();
    matching = matching.filter((e) => {
      const k = `${e.package}:${e.path}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    if (packageFilter) {
      matching = matching.filter((comp) => matchesCategoryFilter(comp, packageFilter));
    }

    matching.sort((a, b) => a.path.localeCompare(b.path));

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              components: matching,
              total: matching.length,
              hint: "Use importPath for consumer imports. category = feature folder (views, organization, two-factor, settings, …), lib = client plugins, email = react-email templates.",
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  async readComponentCode(packageName: string, componentPath: string) {
    if (packages.size === 0) {
      await this.loadPackageInfo();
    }

    const pkg = packages.get(packageName);
    if (!pkg) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: `Package ${packageName} not found` }, null, 2),
          },
        ],
      };
    }

    const baseDir = pkg.srcDir ?? pkg.packageDir;
    const baseRoot = resolve(baseDir);
    const resolvedPath = resolve(baseDir, componentPath);

    const allowedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
    if (!allowedExtensions.has(extname(resolvedPath).toLowerCase())) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                error: `Unsupported file type. Allowed extensions: ${[...allowedExtensions].join(", ")}`,
                package: packageName,
                requestedPath: componentPath,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    if (resolvedPath !== baseRoot && !resolvedPath.startsWith(`${baseRoot}${sep}`)) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                error: `Component path escapes source directory: ${componentPath}`,
                package: packageName,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    try {
      await access(resolvedPath);
      const code = await readFile(resolvedPath, "utf-8");
      const relFromSrc = pkg.srcDir
        ? relative(pkg.srcDir, resolvedPath).replace(/\\/g, "/")
        : componentPath.replace(/\\/g, "/");

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                package: packageName,
                component: relFromSrc,
                importPath: toImportPath(packageName, relFromSrc),
                category: categorize(relFromSrc),
                code,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      console.error(`[mcp] read_component_code failed for ${packageName}/${componentPath}:`, error);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                error: `Component file not found: ${componentPath}`,
                package: packageName,
                tip: "Pass path relative to src/, e.g. sign-in.tsx, organization/organization-settings.tsx, lib/organization-plugin.tsx, email/email-verification.tsx",
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  async getUsageExample(packageName: string, componentName?: string) {
    if (packages.size === 0) {
      await this.loadPackageInfo();
    }

    const pkg = packages.get(packageName);
    if (!pkg) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: `Package ${packageName} not found` }, null, 2),
          },
        ],
      };
    }

    let matches: ComponentEntry[] = [];
    if (componentName) {
      const q = componentName.toLowerCase();
      const exact = (components.get(q) ?? []).filter((h) => h.package === packageName);
      if (exact.length > 0) {
        matches = exact;
      } else {
        matches = Array.from(components.values())
          .flat()
          .filter(
            (h) =>
              h.package === packageName &&
              (h.path.toLowerCase().includes(q) || h.importPath.toLowerCase().includes(q)),
          );
      }
    }

    const matched = matches[0];

    const readmePath = pkg.srcDir
      ? join(pkg.srcDir, "..", "README.md")
      : join(pkg.packageDir, "README.md");

    let readme: string | null = null;
    try {
      await access(readmePath);
      readme = await readFile(readmePath, "utf-8");
    } catch (error) {
      console.error(`[mcp] no README for ${packageName}:`, error);
    }

    const example = this.generateUsageExample(packageName, matches, componentName);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              package: packageName,
              component: componentName,
              match: matched
                ? {
                    path: matched.path,
                    importPath: matched.importPath,
                    category: matched.category,
                  }
                : null,
              matches: matches.map((m) => ({
                path: m.path,
                importPath: m.importPath,
                category: m.category,
              })),
              example,
              readme: readme,
              docs:
                packageName === UI_PACKAGE
                  ? {
                      betterAuth: "https://www.better-auth.com",
                      betterAuthUi: "https://github.com/better-auth-ui/better-auth-ui",
                    }
                  : undefined,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  private generateUsageExample(
    packageName: string,
    matches: ComponentEntry[],
    componentName?: string,
  ): string {
    if (packageName === UI_PACKAGE && matches.length === 0 && !componentName) {
      return `// @kumix/better-auth-ui — per-file imports (no barrel)
import { AuthProvider } from "@kumix/better-auth-ui/auth-provider";
import { Auth } from "@kumix/better-auth-ui/auth";
import { SignIn } from "@kumix/better-auth-ui/sign-in";
import { organizationPlugin } from "@kumix/better-auth-ui/lib/organization-plugin";
import { ToastContainer } from "@kumix/ui/custom/toast";
import { authClient } from "./auth-client";

// AuthProvider requires authClient + navigate (wire to your router);
// Auth requires the current path (or an explicit view).
export function App() {
  return (
    <AuthProvider authClient={authClient} navigate={({ to, replace }) => router.push(to, { replace })}>
      <Auth path={pathname} />
      <ToastContainer />
    </AuthProvider>
  );
}

// Views:    @kumix/better-auth-ui/sign-in | sign-up | verify-email | forgot-password | reset-password | magic-link
// Plugins:  @kumix/better-auth-ui/lib/<feature>-plugin
// Emails:   @kumix/better-auth-ui/email/<template>
// Styling:  primitives from @kumix/ui (import { Button } from "@kumix/ui/ui/button")
// Docs:     https://www.better-auth.com · https://github.com/better-auth-ui/better-auth-ui`;
    }

    if (matches.length > 1) {
      const lines = matches.map((m) => {
        const symbol = m.name
          .split("-")
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join("");
        return `// ${m.category}: import { ${symbol} } from "${m.importPath}";`;
      });
      return `// Multiple matches for "${componentName}" — pick one (category = feature folder):\n${lines.join("\n")}`;
    }

    const matched = matches[0];
    if (matched) {
      if (matched.category === "lib" || matched.category === "email") {
        return `// ${matched.path} (${matched.category})
import { /* named export from file */ } from "${matched.importPath}";

// Source: packages/ui/src/${matched.path}
// Import: ${matched.importPath}`;
      }

      const symbol = matched.name
        .split("-")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join("");
      return `// ${matched.path} (${matched.category})
import { ${symbol} } from "${matched.importPath}";

export function Example() {
  return <${symbol} />;
}

// Import: ${matched.importPath}
// Source: packages/ui/src/${matched.path}
// Docs: package README`;
    }

    if (componentName) {
      return `// Component "${componentName}" not indexed. Try find_component first.
// @kumix/better-auth-ui uses per-file imports, e.g.:
//   @kumix/better-auth-ui/sign-in
//   @kumix/better-auth-ui/organization/organization-settings
//   @kumix/better-auth-ui/lib/organization-plugin
//   @kumix/better-auth-ui/email/email-verification`;
    }

    return `import "${packageName}";`;
  }
}

const server = new McpServer({
  name: "Kumix Better Auth UI",
  version: SERVER_VERSION,
});

const kumixServer = new KumixUiMCPServer();

server.registerTool(
  "list_packages",
  {
    description:
      "List all available Kumix packages (scanned from packages/**). Includes @kumix/better-auth-ui category counts (views + feature folders like organization/two-factor/settings, lib = client plugins, email = react-email templates).",
    inputSchema: {},
  },
  async () => kumixServer.listPackages(),
);

server.registerTool(
  "get_package_info",
  {
    description:
      "Get detailed package metadata, exports, peer deps, and sample import paths for @kumix/better-auth-ui.",
    inputSchema: {
      package_name: z
        .string()
        .min(1, "Package name is required")
        .describe("The name of the package (e.g., @kumix/better-auth-ui)"),
    },
  },
  async ({ package_name }) => kumixServer.getPackageInfo(package_name),
);

server.registerTool(
  "find_component",
  {
    description:
      "Find components by name or path. Returns importPath for consumers. Filter by category (feature folder: views, organization, settings, two-factor, api-key, …; lib, email) or package name fragment.",
    inputSchema: {
      component_name: z
        .string()
        .min(1, "Component name is required")
        .describe(
          "Component or file name fragment (e.g. sign-in, organization-settings, admin-users, organization-plugin, email-verification)",
        ),
      package_filter: z
        .string()
        .optional()
        .describe(
          "Optional filter: feature folder (views | organization | settings | two-factor | …) | lib | email | package name fragment",
        ),
    },
  },
  async ({ component_name, package_filter }) =>
    kumixServer.findComponent(component_name, package_filter),
);

server.registerTool(
  "read_component_code",
  {
    description:
      "Read source relative to package src/ (e.g. sign-in.tsx, organization/organization-settings.tsx, lib/organization-plugin.tsx, email/email-verification.tsx).",
    inputSchema: {
      package_name: z
        .string()
        .min(1, "Package name is required")
        .describe("The package containing the component"),
      component_path: z
        .string()
        .min(1, "Component path is required")
        .describe("Relative path from src/, e.g. sign-in.tsx or lib/organization-plugin.tsx"),
    },
  },
  async ({ package_name, component_path }) =>
    kumixServer.readComponentCode(package_name, component_path),
);

server.registerTool(
  "get_usage_example",
  {
    description:
      "Usage example with correct per-file import path, plus package README when present.",
    inputSchema: {
      package_name: z
        .string()
        .min(1, "Package name is required")
        .describe("The package to get examples for"),
      component_name: z
        .string()
        .optional()
        .describe(
          "Optional component/file name (e.g. sign-in, organization-settings, organization-plugin, email-verification)",
        ),
    },
  },
  async ({ package_name, component_name }) =>
    kumixServer.getUsageExample(package_name, component_name),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Kumix Better Auth UI MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

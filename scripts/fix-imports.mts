import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { posix } from "node:path";

const files: string[] = [];
function walk(dir: string) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx|ts)$/.test(e.name)) files.push(p);
  }
}
walk("src");

function rewriteToasts(s: string): string {
  let result = "";
  let i = 0;
  while (i < s.length) {
    const m = s.indexOf("toast.", i);
    if (m === -1) {
      result += s.slice(i);
      break;
    }
    const rest = s.slice(m);
    const mt = /^toast\.(success|error)\(/.exec(rest);
    if (!mt) {
      result += s.slice(i, m + 6);
      i = m + 6;
      continue;
    }
    const kind = mt[1];
    const open = m + 6 + kind.length; // points at "("
    let depth = 0;
    let j = open;
    for (; j < s.length; j++) {
      if (s[j] === "(") depth++;
      else if (s[j] === ")") {
        depth--;
        if (depth === 0) break;
      }
    }
    const arg = s.slice(open + 1, j).trim();
    const name = kind === "success" ? "toastSuccess" : "toastError";
    result += `${s.slice(i, m)}${name}({ message: ${arg} })`;
    i = j + 1;
  }
  return result;
}

let changed = 0;
for (const f of files) {
  let s = readFileSync(f, "utf8");
  const orig = s;
  const dir = posix.dirname(f);
  const rel = (target: string) => {
    let r = posix.relative(dir, target);
    if (!r.startsWith(".")) r = `./${r}`;
    return r;
  };

  s = s.replace(/from "@\/components\/ui\//g, 'from "@kumix/ui/ui/');
  s = s.replace(
    /from "@\/components\/auth\/([a-z0-9/-]+)"/g,
    (_m, rest: string) => `from "${rel(`src/${rest}`)}"`,
  );
  s = s.replace(
    /from "@\/lib\/auth\/([a-z0-9/-]+)"/g,
    (_m, rest: string) => `from "${rel("src/lib")}/${rest}"`,
  );
  s = s.replace(/import \{ cn \} from "cn";?/g, 'import { cn } from "@kumix/utils";');
  s = s.replace(
    /import \{ useIsHydrated \} from "[.]+\/use-is-hydrated";?/g,
    'import { useHydrated } from "@kumix/ui/hooks/use-hydrated";',
  );
  s = s.replace(/\buseIsHydrated\(/g, "useHydrated(");
  s = rewriteToasts(s);
  const names = [
    s.includes("toastSuccess(") && "toastSuccess",
    s.includes("toastError(") && "toastError",
  ]
    .filter(Boolean)
    .join(", ");
  if (names) {
    s = s.replace(
      /import \{ toast \} from "sonner";?/,
      `import { ${names} } from "@kumix/ui/custom/toast";`,
    );
  }

  if (s !== orig) {
    writeFileSync(f, s);
    changed++;
  }
}
console.log(`rewrote ${changed}/${files.length} files`);

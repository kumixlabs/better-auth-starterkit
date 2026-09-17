import { defineConfig } from "tsdown";

import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  clean: false,
  dts: true,
  publint: true,
  deps: {
    neverBundle: [...Object.keys(pkg.peerDependencies || {}), "lucide-react", "react"],
  },
  entry: ["./src/**/*.ts", "./src/**/*.tsx"],
  format: "esm",
  target: "ES2022",
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
  attw: { profile: "esm-only" },
});

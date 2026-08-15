import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SUPPORTED_PACKS, buildPackSource, validateDefinition } from "./lib/content-contract.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const outRoot = path.join(root, ".build", "pack-sources");

function safeFilename(definition) {
  const slug = String(definition.id).split(".").pop().replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "");
  return `${slug || "affliction"}.json`;
}

await fs.rm(outRoot, { recursive: true, force: true });
await fs.mkdir(outRoot, { recursive: true });

let total = 0;
for (const pack of SUPPORTED_PACKS) {
  const srcDir = path.join(root, "content", pack);
  const outDir = path.join(outRoot, pack);
  await fs.mkdir(outDir, { recursive: true });
  const entries = (await fs.readdir(srcDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"));

  for (const entry of entries) {
    const sourcePath = path.join(srcDir, entry.name);
    const definition = JSON.parse(await fs.readFile(sourcePath, "utf8"));
    const issues = validateDefinition(definition, { pack });
    if (issues.length) {
      throw new Error(`${path.relative(root, sourcePath)} is not publishable:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
    }
    const item = buildPackSource(definition);
    await fs.writeFile(path.join(outDir, safeFilename(definition)), `${JSON.stringify(item, null, 2)}\n`, "utf8");
    total += 1;
  }
}

console.log(`Prepared ${total} Foundry Item source(s) under ${path.relative(root, outRoot)}.`);
console.log("Compile non-empty directories with the official Foundry VTT CLI before release; see docs/BUILDING_PACKS.md.");

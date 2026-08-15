import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SUPPORTED_PACKS,
  deterministicDocumentId,
  expectedContentFilename,
  validateDefinition
} from "./lib/content-contract.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

async function jsonFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(directory, entry.name))
    .sort();
}

const failures = [];
const ids = new Map();
const documentIds = new Map();
let count = 0;

for (const pack of SUPPORTED_PACKS) {
  const directory = path.join(root, "content", pack);
  for (const file of await jsonFiles(directory)) {
    count += 1;
    let definition;
    try {
      definition = JSON.parse(await fs.readFile(file, "utf8"));
    } catch (error) {
      failures.push(`${path.relative(root, file)}: invalid JSON (${error.message})`);
      continue;
    }

    for (const issue of validateDefinition(definition, { pack })) {
      failures.push(`${path.relative(root, file)}: ${issue}`);
    }

    if (definition?.id) {
      const expectedFilename = expectedContentFilename(definition.id);
      const actualFilename = path.basename(file);
      if (!expectedFilename) {
        failures.push(`${path.relative(root, file)}: stable definition id must end in a lowercase kebab-case content key.`);
      } else if (actualFilename !== expectedFilename) {
        failures.push(`${path.relative(root, file)}: filename must match stable content key ${expectedFilename}.`);
      }
    }

    if (definition?.id) {
      const previous = ids.get(definition.id);
      if (previous) failures.push(`${path.relative(root, file)}: duplicate definition id also used by ${previous}`);
      else ids.set(definition.id, path.relative(root, file));

      const documentId = deterministicDocumentId(definition.id);
      const previousDocument = documentIds.get(documentId);
      if (previousDocument) failures.push(`${path.relative(root, file)}: deterministic Foundry _id collision with ${previousDocument}`);
      else documentIds.set(documentId, path.relative(root, file));
    }
  }
}

if (failures.length > 0) {
  console.error(`Content validation failed with ${failures.length} issue(s):`);
  for (const issue of failures) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(`Content validation passed: ${count} definition(s) across ${SUPPORTED_PACKS.length} source packs.`);
}

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}

test("ORC notice carries all four upstream attribution blocks", () => {
  const notice = read("ORC_NOTICE.md");
  assert.match(notice, /Player Core © 2024/i);
  assert.match(notice, /GM Core © 2024/i);
  assert.match(notice, /Player Core 2 © 2024/i);
  assert.match(notice, /Treasure Vault \(Remastered\) © 2025/i);
  assert.match(notice, /TX 9-307-067/);
});

test("license clearly separates software and game-content terms", () => {
  const license = read("LICENSE");
  assert.match(license, /SOFTWARE/);
  assert.match(license, /GAME CONTENT/);
  assert.match(license, /ORC_NOTICE\.md/);
});

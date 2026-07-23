import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const root = resolve(process.argv[2] || "");
const version = process.argv[3] || "";

if (!root || !/^[a-zA-Z0-9._-]+$/.test(version)) {
  throw new Error("Usage: node version-assets.mjs <site-directory> <version>");
}

const assetReference =
  /\b(src|href)=(["'])(?!https?:|\/\/|data:|blob:)([^"'?#]+?\.(?:css|js))(?:\?[^"'#]*)?(#[^"']*)?\2/gi;

let changedFiles = 0;
let changedReferences = 0;

async function versionHtml(filePath) {
  const source = await readFile(filePath, "utf8");
  let fileReferences = 0;
  const versioned = source.replace(
    assetReference,
    (match, attribute, quote, assetPath, hash = "") => {
      fileReferences += 1;
      return `${attribute}=${quote}${assetPath}?v=${version}${hash}${quote}`;
    }
  );

  if (!fileReferences) return;
  await writeFile(filePath, versioned);
  changedFiles += 1;
  changedReferences += fileReferences;
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(filePath);
      continue;
    }
    if (entry.isFile() && [".htm", ".html"].includes(extname(entry.name))) {
      await versionHtml(filePath);
    }
  }
}

await walk(root);
console.log(
  `Versioned ${changedReferences} CSS/JS references in ${changedFiles} HTML files`
);

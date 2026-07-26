import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(toolsDir, "..");
const gameDir = path.resolve(projectDir, "..");
const dataPath = path.join(projectDir, "data.js");
const errors = [];

for (const required of [
  "index.html",
  "styles.css",
  "app.js",
  "data.js",
  "baslat.bat",
  "README.md",
]) {
  if (!fs.existsSync(path.join(projectDir, required))) {
    errors.push(`Eksik dosya: ${required}`);
  }
}

let data;
try {
  const source = fs.readFileSync(dataPath, "utf8");
  data = JSON.parse(
    source
      .replace(/^window\.HASH_ATLAS_DATA\s*=\s*/, "")
      .replace(/;\s*$/, ""),
  );
} catch (error) {
  errors.push(`data.js okunamadı: ${error.message}`);
}

if (data) {
  const expected = {
    siteCount: 51,
    pageCount: 132,
    direct: 481,
    clickable: 371,
    decoy: 340,
    mixed: 36,
    uniqueMarkers: 1156,
  };

  for (const [key, value] of Object.entries(expected)) {
    if (data.stats[key] !== value) {
      errors.push(`stats.${key}: ${data.stats[key]} (beklenen ${value})`);
    }
  }

  const pageIds = new Set();
  const knownSites = new Set(data.sites.map((site) => site.id));
  for (const page of data.pages) {
    if (pageIds.has(page.id)) errors.push(`Tekrarlanan sayfa kimliği: ${page.id}`);
    pageIds.add(page.id);

    if (!knownSites.has(page.siteId)) {
      errors.push(`Sitesiz sayfa: ${page.id}`);
    }
    if (page.uniqueMarkers <= 0) {
      errors.push(`İşaretsiz sayfa: ${page.id}`);
    }

    const sourcePath = path.join(gameDir, ...page.source.split("/"));
    const previewPath = path.join(projectDir, ...page.preview.split("/"));
    if (!fs.existsSync(sourcePath)) {
      errors.push(`Kaynak bulunamadı: ${page.source}`);
    }
    if (!fs.existsSync(previewPath)) {
      errors.push(`Ön izleme bulunamadı: ${page.preview}`);
      continue;
    }

    const preview = fs.readFileSync(previewPath, "utf8");
    if (!preview.includes('id="hash-guide-style"')) {
      errors.push(`İşaret stili eksik: ${page.preview}`);
    }
    if (!preview.includes('id="hash-guide-script"')) {
      errors.push(`İşaret betiği eksik: ${page.preview}`);
    }
    if (!preview.includes("<base href=")) {
      errors.push(`Kaynak yolu eksik: ${page.preview}`);
    }
  }

  for (const site of data.sites) {
    const actual = data.pages.filter((page) => page.siteId === site.id).length;
    if (actual !== site.pageCount) {
      errors.push(
        `${site.id} sayfa sayısı: ${actual} (kayıtlı ${site.pageCount})`,
      );
    }
  }
}

const report = {
  green: errors.length === 0,
  checkedSites: data?.sites.length ?? 0,
  checkedPages: data?.pages.length ?? 0,
  errors,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;

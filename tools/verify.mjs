import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(toolsDir, "..");
const gameDir = path.resolve(projectDir, "..");
const errors = [];
const checkedStylesheets = new Set();
const datasets = new Map();
const expectedStats = {
  siteCount: 51,
  pageCount: 132,
  direct: 481,
  clickable: 371,
  decoy: 340,
  mixed: 36,
  uniqueMarkers: 1156,
};
const localeConfigs = [
  {
    locale: "tr",
    file: "data.js",
    globalName: "HASH_ATLAS_DATA",
    previewRoot: "previews",
    markerTitle: "HASH İŞARETLERİ",
  },
  {
    locale: "en",
    file: "data-en.js",
    globalName: "HASH_ATLAS_DATA_EN",
    previewRoot: "previews-en",
    markerTitle: "HASH MARKERS",
  },
];

for (const required of [
  "index.html",
  "styles.css",
  "app.js",
  "data.js",
  "data-en.js",
  "baslat.bat",
  "README.md",
  "previews",
  "previews-en",
]) {
  if (!fs.existsSync(path.join(projectDir, required))) {
    errors.push(`Eksik dosya veya klasör: ${required}`);
  }
}

for (const config of localeConfigs) {
  const data = readData(config);
  if (!data) continue;
  datasets.set(config.locale, data);
  verifyData(config, data);
}

if (datasets.size === localeConfigs.length) {
  const trIds = datasets.get("tr").pages.map((page) => page.id).sort();
  const enIds = datasets.get("en").pages.map((page) => page.id).sort();
  if (JSON.stringify(trIds) !== JSON.stringify(enIds)) {
    errors.push("TR ve EN sayfa kimlikleri eşleşmiyor.");
  }
}

const report = {
  green: errors.length === 0,
  locales: Object.fromEntries(
    [...datasets].map(([locale, data]) => [
      locale,
      {
        sites: data.sites.length,
        pages: data.pages.length,
        markers: data.stats.uniqueMarkers,
      },
    ]),
  ),
  errors,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;

function readData(config) {
  try {
    const source = fs.readFileSync(path.join(projectDir, config.file), "utf8");
    const prefix = new RegExp(
      `^window\\.${config.globalName}\\s*=\\s*`,
    );
    return JSON.parse(
      source.replace(prefix, "").replace(/;\s*$/, ""),
    );
  } catch (error) {
    errors.push(`${config.file} okunamadı: ${error.message}`);
    return null;
  }
}

function verifyData(config, data) {
  const label = config.locale.toUpperCase();

  for (const [key, value] of Object.entries(expectedStats)) {
    if (data.stats[key] !== value) {
      errors.push(
        `${label} stats.${key}: ${data.stats[key]} (beklenen ${value})`,
      );
    }
  }

  if (config.locale === "en" && data.locale !== "en") {
    errors.push(`EN veri dili yanlış: ${data.locale ?? "tanımsız"}`);
  }

  const pageIds = new Set();
  const knownSites = new Set(data.sites.map((site) => site.id));
  for (const page of data.pages) {
    if (pageIds.has(page.id)) {
      errors.push(`${label} tekrarlanan sayfa kimliği: ${page.id}`);
    }
    pageIds.add(page.id);

    if (!knownSites.has(page.siteId)) {
      errors.push(`${label} sitesiz sayfa: ${page.id}`);
    }
    if (page.uniqueMarkers <= 0) {
      errors.push(`${label} işaretsiz sayfa: ${page.id}`);
    }
    if (!page.preview.startsWith(`${config.previewRoot}/`)) {
      errors.push(
        `${label} yanlış ön izleme kökü: ${page.id} -> ${page.preview}`,
      );
    }

    const sourcePath = path.join(gameDir, ...page.source.split("/"));
    const previewPath = path.join(projectDir, ...page.preview.split("/"));
    if (!fs.existsSync(sourcePath)) {
      errors.push(`${label} kaynak bulunamadı: ${page.source}`);
    }
    if (!fs.existsSync(previewPath)) {
      errors.push(`${label} ön izleme bulunamadı: ${page.preview}`);
      continue;
    }

    const preview = fs.readFileSync(previewPath, "utf8");
    if (!preview.includes('id="hash-guide-style"')) {
      errors.push(`${label} işaret stili eksik: ${page.preview}`);
    }
    if (!preview.includes('id="hash-guide-script"')) {
      errors.push(`${label} işaret betiği eksik: ${page.preview}`);
    }
    if (!preview.includes(config.markerTitle)) {
      errors.push(`${label} işaret açıklaması yanlış: ${page.preview}`);
    }
    if (/<base\b/i.test(preview)) {
      errors.push(`${label} haricî base yolu bulundu: ${page.preview}`);
    }
    checkHtmlAssets(previewPath, preview, `${label} ${page.preview}`);
  }

  for (const site of data.sites) {
    const actual = data.pages.filter((page) => page.siteId === site.id).length;
    if (actual !== site.pageCount) {
      errors.push(
        `${label} ${site.id} sayfa sayısı: ${actual} (kayıtlı ${site.pageCount})`,
      );
    }
  }
}

function checkHtmlAssets(filePath, html, label) {
  const tagPattern = /<(?:link|script|img|source|video|audio)\b[^>]*>/gi;
  const attributePattern = /\b(?:src|href|poster)\s*=\s*(["'])(.*?)\1/gi;

  for (const tag of html.match(tagPattern) ?? []) {
    for (const match of tag.matchAll(attributePattern)) {
      checkAssetReference(filePath, match[2], label);
    }
  }

  checkCssReferences(filePath, html, label);
}

function checkCssReferences(filePath, css, label) {
  const urlPattern = /url\(\s*(["']?)(.*?)\1\s*\)/gi;
  const importPattern = /@import\s+(?:url\(\s*)?(["'])(.*?)\1\s*\)?/gi;

  for (const match of css.matchAll(urlPattern)) {
    checkAssetReference(filePath, match[2], label);
  }
  for (const match of css.matchAll(importPattern)) {
    checkAssetReference(filePath, match[2], label);
  }
}

function checkAssetReference(fromFile, rawReference, label) {
  const reference = rawReference.trim();
  if (
    !reference ||
    reference.startsWith("#") ||
    /^(?:data|blob|https?|mailto|tel|javascript):/i.test(reference) ||
    reference.startsWith("//")
  ) {
    return;
  }

  const cleanReference = reference.split(/[?#]/, 1)[0];
  if (!cleanReference) return;
  if (cleanReference.startsWith("/")) {
    errors.push(`Kökten başlayan asset yolu: ${label} -> ${reference}`);
    return;
  }

  let decodedReference;
  try {
    decodedReference = decodeURIComponent(cleanReference);
  } catch {
    errors.push(`Geçersiz asset yolu: ${label} -> ${reference}`);
    return;
  }

  const assetPath = path.resolve(path.dirname(fromFile), decodedReference);
  if (!assetPath.startsWith(`${projectDir}${path.sep}`)) {
    errors.push(`Proje dışına çıkan asset yolu: ${label} -> ${reference}`);
    return;
  }
  if (!fs.existsSync(assetPath)) {
    errors.push(`Eksik asset: ${label} -> ${reference}`);
    return;
  }

  const caseMismatch = findCaseMismatch(assetPath);
  if (caseMismatch) {
    errors.push(
      `Asset harf uyumsuzluğu: ${label} -> ${reference} (${caseMismatch})`,
    );
    return;
  }

  if (
    path.extname(assetPath).toLowerCase() === ".css" &&
    !checkedStylesheets.has(assetPath)
  ) {
    checkedStylesheets.add(assetPath);
    checkCssReferences(
      assetPath,
      fs.readFileSync(assetPath, "utf8"),
      path.relative(projectDir, assetPath).replaceAll(path.sep, "/"),
    );
  }
}

function findCaseMismatch(filePath) {
  const segments = path.relative(projectDir, filePath).split(path.sep);
  let currentPath = projectDir;

  for (const segment of segments) {
    const entries = fs.readdirSync(currentPath);
    if (!entries.includes(segment)) {
      const actual = entries.find(
        (entry) =>
          entry.toLocaleLowerCase("en") === segment.toLocaleLowerCase("en"),
      );
      if (actual) return `${segment} yerine ${actual}`;
      return "";
    }
    currentPath = path.join(currentPath, segment);
  }

  return "";
}

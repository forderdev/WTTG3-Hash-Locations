import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const projectDir = path.resolve(toolsDir, "..");
const gameDir = path.resolve(projectDir, "..");
const keyCore = require(path.join(projectDir, "key-organizer-core.js"));
const helperCore = require(path.join(projectDir, "helper-core.js"));
const saveReader = require(path.join(projectDir, "save-reader-core.js"));
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
  "helper.js",
  "helper-core.js",
  "helper-data.js",
  "key-organizer-core.js",
  "save-reader-core.js",
  "data.js",
  "data-en.js",
  "baslat.bat",
  "README.md",
  "previews",
  "previews-en",
  "docs/key-organizer-research.md",
  "docs/hash-decryptor-and-save-import-research.md",
]) {
  if (!fs.existsSync(path.join(projectDir, required))) {
    errors.push(`Eksik dosya veya klasör: ${required}`);
  }
}

verifyKeyOrganizer();
verifyHelper();

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

function verifyKeyOrganizer() {
  const single = keyCore.parseIndexedFragments("1 - 2bfc88a4");
  if (
    single.entries.length !== 1 ||
    single.entries[0].index !== 1 ||
    single.entries[0].encrypted !== "2bfc88a4"
  ) {
    errors.push("Organizer indeksli hash'i ayrıştıramadı.");
  }

  const uppercase = keyCore.parseIndexedFragments("1-2BFC88A4");
  if (uppercase.entries[0]?.encrypted !== "2bfc88a4") {
    errors.push("Organizer büyük harfli hash'i normalize edemedi.");
  }

  const bulk = keyCore.parseIndexedFragments(
    "3 - b2a23ff2\n1 - 1ef9d5b6\n3 - ff6b\n1 - 36EA",
  );
  if (
    bulk.entries.length !== 2 ||
    bulk.entries[0].index !== 1 ||
    bulk.entries[0].decrypted !== "36ea" ||
    bulk.entries[1].index !== 3 ||
    bulk.entries[1].decrypted !== "ff6b"
  ) {
    errors.push("Organizer toplu girdiyi indeks sırasına yerleştiremedi.");
  }

  const rejected = keyCore.parseIndexedFragments(
    "0 - 2bfc88a4\n9 - 2bfc88a4\n1 - 2bfc88a\n2 - 2bfc88a44",
  );
  if (rejected.entries.length || rejected.conflicts.length) {
    errors.push("Organizer geçersiz indeks veya uzunluğu reddetmedi.");
  }

  const conflict = keyCore.parseIndexedFragments(
    "1 - 2bfc88a4\n1 - 1ef9d5b6",
  );
  if (
    conflict.conflicts.length !== 1 ||
    conflict.entries.length !== 0
  ) {
    errors.push("Organizer aynı indeks çakışmasını yakalayamadı.");
  }

  const agentReply = keyCore.parseSingleHex(
    "Decrypted key: 36EA",
    keyCore.DECRYPTED_LENGTH,
  );
  if (agentReply.status !== "valid" || agentReply.value !== "36ea") {
    errors.push("Organizer ajan yanıtındaki çözülmüş parçayı okuyamadı.");
  }

  const state = keyCore.createEmptyState();
  const encrypted = [
    "1ef9d5b6",
    "2f45095a",
    "b2a23ff2",
    "ac4742d5",
    "969a03ed",
    "5dd6f03c",
    "bbd6e8c6",
    "e01fdd64",
  ];
  const decrypted = [
    "36ea",
    "84be",
    "ff6b",
    "7b6b",
    "286d",
    "052b",
    "741f",
    "f735",
  ];
  state.forEach((entry, index) => {
    entry.encrypted = encrypted[index];
    entry.decrypted = decrypted[index];
    entry.wiki = (index % 3) + 1;
  });

  const expectedMasterKey = "36ea84beff6b7b6b286d052b741ff735";
  if (keyCore.getMasterKey(state) !== expectedMasterKey) {
    errors.push("Organizer 32 karakterlik master key'i yanlış oluşturdu.");
  }
  const progress = keyCore.getProgress(state);
  if (progress.found !== 8 || progress.decrypted !== 8) {
    errors.push("Organizer ilerleme sayacını yanlış hesapladı.");
  }

  state[7].decrypted = "";
  if (keyCore.getMasterKey(state) !== "") {
    errors.push("Organizer eksik çözülmüş parçayla master key üretti.");
  }
}

function verifyHelper() {
  const helperSource = fs.readFileSync(
    path.join(projectDir, "helper-data.js"),
    "utf8",
  );
  const sandbox = { window: {} };
  vm.runInNewContext(helperSource, sandbox, { filename: "helper-data.js" });
  const helperData = sandbox.window.WTTG3_HELPER_DATA;
  if (!helperData) {
    errors.push("Helper veri dosyası yüklenemedi.");
    return;
  }

  const schedules = Object.entries(helperData.schedules);
  if (schedules.length !== 51) {
    errors.push(`Site saati tablosu 51 yerine ${schedules.length} site içeriyor.`);
  }
  const alwaysCount = schedules.filter(([, schedule]) => schedule === null).length;
  if (alwaysCount !== 26) {
    errors.push(`Her zaman açık site sayısı 26 yerine ${alwaysCount}.`);
  }
  const openAtZero = schedules.filter(([, schedule]) =>
    helperCore.isSiteOpen(schedule, 0),
  ).length;
  if (openAtZero !== 37) {
    errors.push(`:00 anında açık site sayısı 37 yerine ${openAtZero}.`);
  }
  if (
    helperCore.getNextChangeDelta(
      schedules.map(([, schedule]) => schedule),
      0,
    ) !== 15
  ) {
    errors.push("Site saati sonraki değişimi yanlış hesapladı.");
  }

  const miners = helperData.miners;
  if (miners.length !== 30 || new Set(miners.map((miner) => miner.name)).size !== 30) {
    errors.push("VirtMesh tablosu 30 benzersiz makine içermiyor.");
  }
  for (const tier of [1, 2, 3]) {
    if (miners.filter((miner) => miner.tier === tier).length !== 10) {
      errors.push(`VirtMesh Tier ${tier} tablosu 10 makine içermiyor.`);
    }
  }
  const total = helperCore.calculateMinerTotal(
    miners,
    ["WebTyk", "GameDrux", "OpsHax", "Phoenix"],
  );
  if (Math.abs(total.total - 14.78) > 0.0001 || total.unknown !== 0) {
    errors.push("VirtMesh toplam hız hesabı yanlış.");
  }
  const imported = helperCore.matchMinerNames(
    miners,
    ["WebTyk", "GameDrux", "OpsHax", "Phoenix"],
  );
  if (imported.length !== 4) {
    errors.push("VirtMesh save makinesi eşleştirmesi başarısız.");
  }

  const mappings = [
    { index: 1, encrypted: "1ef9d5b6", decrypted: "36ea" },
    { index: 2, encrypted: "2f45095a", decrypted: "84be" },
  ];
  const resolved = helperCore.resolveIndexedHashes(
    "1 - 1ef9d5b6\n2 - 2f45095a",
    keyCore,
    mappings,
  );
  if (
    resolved.matched !== 2 ||
    resolved.lines.join("\n") !== "1 - 36ea\n2 - 84be"
  ) {
    errors.push("Hash çözümleyici doğrulanmış çiftleri üretemedi.");
  }
  const mismatch = helperCore.resolveIndexedHashes(
    "1 - aaaaaaaa",
    keyCore,
    mappings,
  );
  if (mismatch.matched !== 0 || mismatch.lines[0] !== "1 - no match") {
    errors.push("Hash çözümleyici eşleşmeyen değeri reddetmedi.");
  }

  const screenshotInput = [
    "1 - 1ef9d5b6",
    "2 - 2f45095a",
    "3 - b2a23ff2",
    "4 - ac4742d5",
    "5 - 969a03ed",
    "6 - 5dd6f03c",
    "7 - bbd6e8c6",
    "8 - e01fdd64",
  ].join("\n");
  const screenshotExpected = [
    "1 - 36ea",
    "2 - 84be",
    "3 - ff6b",
    "4 - 7b6b",
    "5 - 286d",
    "6 - 052b",
    "7 - 741f",
    "8 - f735",
  ].join("\n");
  const screenshotResolved = helperCore.resolveIndexedHashes(
    screenshotInput,
    keyCore,
    helperData.verifiedKeyPairs ?? [],
  );
  if (
    screenshotResolved.matched !== 8 ||
    screenshotResolved.lines.join("\n") !== screenshotExpected
  ) {
    errors.push("Hash çözümleyici ekran görüntüsündeki doğrulanmış run'ı çözemedi.");
  }

  try {
    saveReader.parseSave(new TextEncoder().encode("not-a-save"));
    errors.push("Save okuyucu geçersiz dosyayı reddetmedi.");
  } catch {
    // Expected.
  }
}

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

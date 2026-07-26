import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(toolsDir, "..");
const gameDir = path.resolve(projectDir, "..");
const sourceDir = path.join(
  gameDir,
  "WTTGSD",
  "Content",
  "RawFiles",
  "WebSites",
);
const previewDir = path.join(projectDir, "previews");
const dataFile = path.join(projectDir, "data.js");

const canonicalNames = {
  bizarrepropagation: "Bizarre Propagation",
  blackhatpost: "Blackhat Post",
  blushingbrides: "Blushing Brides",
  buildingafuture: "Building A Future",
  cavitylease: "Cavity Lease",
  chevron: "Chevron",
  crisiscalls: "Crisis Calls",
  crystalguild: "Crystal Guild",
  doctormurder: "Doctor Murder",
  dontwasteit: "Don't Waste It",
  doughy: "Doughy",
  drugtickets: "Drug Tickets",
  ems: "Eat My Shit",
  encrave: "Encrave",
  finalstanding: "finalStanding",
  findlove: "FindLove",
  foreverfriend: "Forever Friend",
  forsakengifts: "Forsaken Gifts",
  iamhere: "I Am Here",
  jakobssink: "Jakobs Sink",
  keepsake: "Keep Sake",
  killforme: "Kill For Me",
  labmonkey: "Lab Monkey",
  losttapes: "LostTapes",
  mamabruguglio: "MamaBruguglio",
  morsnmoremarket: "Mors N More Market",
  oneless: "Oneless",
  orderofnine: "Order Of Nine",
  overnightsuccess: "Overnight Success",
  prohibitedstockpile: "Prohibited Stockpile",
  redhanded: "Red Handed",
  redtriangle: "Red Triangle",
  ringring: "Ring Ring",
  shelter: "Shelter",
  symphoroschosen: "Symphoros Chosen",
  synapsedecay: "Synapse Decay",
  tangodown: "Tango Down",
  thanksforvisting: "Thanks For Visiting!",
  thebombmaker: "The Bomb Maker",
  thegrey: "The Grey",
  thehall: "The Hall",
  thehole: "The Hole",
  thelightwithin: "The Light Within",
  theloogaroo: "The Loogaroo",
  theprey: "The Prey",
  timesharing: "Time Sharing",
  track06: "TRACK06",
  viamarisroute: "ViaMarisRoute",
  voluvision: "VoluVision",
  worldwideworkers: "World Wide Workers",
  youthere: "You There?",
};

const pageNames = {
  index: "Ana sayfa",
  about: "Hakkında",
  account: "Hesap",
  answer: "Cevap",
  catalog: "Katalog",
  checkout: "Ödeme",
  connected: "Bağlantı",
  contact: "İletişim",
  creepy: "Creepy",
  donate: "Bağış",
  error: "Hata",
  events: "Etkinlikler",
  evident: "Evident",
  fakemain: "Sahte ana sayfa",
  faq: "SSS",
  gateopen: "Açık kapı",
  getmoney: "Get Money",
  gifts: "Hediyeler",
  hire: "İşe al",
  holdit: "Hold It",
  inanis: "Inanis",
  instructions: "Talimatlar",
  invest: "Yatırım",
  join: "Katıl",
  jolly: "Jolly",
  latus: "Latus",
  live: "Canlı",
  locations: "Konumlar",
  login: "Giriş",
  menu: "Menü",
  myfriends: "Arkadaşlarım",
  no: "Hayır",
  nocontent: "İçerik yok",
  occasionally: "Occasionally",
  order: "Sipariş",
  ordersent: "Sipariş gönderildi",
  packages: "Paketler",
  page2: "Sayfa 2",
  payment: "Ödeme",
  plug: "Plug",
  portal: "Portal",
  post1: "Gönderi 1",
  post2: "Gönderi 2",
  post4: "Gönderi 4",
  post6: "Gönderi 6",
  purchase: "Satın al",
  questions: "Sorular",
  resetpassword: "Şifre sıfırla",
  results: "Sonuçlar",
  samples: "Örnekler",
  saved: "Saved",
  secret: "Gizli sayfa",
  secondpage: "Sayfa 2",
  sendlinks: "Bağlantı gönder",
  signin: "Giriş",
  sleeptalk: "Sleep Talk",
  slide2: "Slayt 2",
  smile: "Smile",
  submit: "Gönder",
  succulentmeal: "Succulent Meal",
  targets: "Hedefler",
  testimonials: "Yorumlar",
  thesearch: "Arayış",
  thirdpage: "Sayfa 3",
  ulike: "U Like",
  vision: "Vision",
  watch: "İzle",
  welcome: "Karşılama",
  yes: "Evet",
};

const markerStyle = `
<style id="hash-guide-style">
  :root {
    --guide-direct: #2ec4b6;
    --guide-click: #f4b942;
    --guide-decoy: #ef665f;
    --guide-mixed: #b897e8;
  }
  .hash-guide-target {
    position: relative !important;
    outline: 3px solid var(--guide-color) !important;
    outline-offset: 3px !important;
    box-shadow: 0 0 0 1px rgba(0,0,0,.85), 0 0 18px color-mix(in srgb, var(--guide-color) 55%, transparent) !important;
  }
  .hash-guide-target::after {
    content: attr(data-hash-guide);
    position: absolute !important;
    z-index: 2147483646 !important;
    top: -22px !important;
    left: -3px !important;
    min-width: 20px !important;
    padding: 3px 6px !important;
    border: 1px solid rgba(0,0,0,.7) !important;
    border-radius: 3px !important;
    background: var(--guide-color) !important;
    color: #101214 !important;
    font: 700 11px/1.1 Consolas, monospace !important;
    text-align: center !important;
    white-space: nowrap !important;
    pointer-events: none !important;
  }
  .hash-guide-direct { --guide-color: var(--guide-direct); }
  .hash-guide-click { --guide-color: var(--guide-click); }
  .hash-guide-decoy { --guide-color: var(--guide-decoy); }
  .hash-guide-mixed { --guide-color: var(--guide-mixed); }
  em.hash-guide-target:empty,
  a.hash-guide-target:empty,
  span.hash-guide-target:empty {
    display: inline-block !important;
    width: 38px !important;
    min-width: 38px !important;
    height: 16px !important;
    min-height: 16px !important;
    vertical-align: middle !important;
    background: color-mix(in srgb, var(--guide-color) 22%, transparent) !important;
  }
  #hash-guide-legend {
    position: fixed !important;
    z-index: 2147483647 !important;
    right: 12px !important;
    bottom: 12px !important;
    display: grid !important;
    gap: 5px !important;
    width: max-content !important;
    max-width: 260px !important;
    padding: 10px 12px !important;
    border: 1px solid rgba(255,255,255,.24) !important;
    border-radius: 6px !important;
    background: rgba(14,16,18,.92) !important;
    box-shadow: 0 8px 30px rgba(0,0,0,.45) !important;
    color: #f1eee6 !important;
    font: 600 11px/1.35 Consolas, monospace !important;
    pointer-events: none !important;
  }
  #hash-guide-legend b { color: #fff !important; font: inherit !important; }
  #hash-guide-legend span { display: inline-flex !important; align-items: center !important; gap: 7px !important; }
  #hash-guide-legend i { display: inline-block !important; width: 9px !important; height: 9px !important; border-radius: 50% !important; background: var(--dot) !important; }
</style>`;

const markerScript = `
<script id="hash-guide-script">
(() => {
  const mark = (element, type, label) => {
    element.classList.add("hash-guide-target", "hash-guide-" + type);
    element.dataset.hashGuide = label;
  };

  let direct = 0;
  let click = 0;
  let decoy = 0;
  let mixed = 0;

  document.querySelectorAll(".PTAG").forEach((element) => {
    direct += 1;
    mark(element, "direct", "P" + direct);
  });

  document.querySelectorAll(".CPTAG, .CFTAG").forEach((element) => {
    if (element.classList.contains("CPTAG") && element.classList.contains("CFTAG")) {
      mixed += 1;
      mark(element, "mixed", "C/F" + mixed);
    } else if (element.classList.contains("CPTAG")) {
      click += 1;
      mark(element, "click", "C" + click);
    } else {
      decoy += 1;
      mark(element, "decoy", "F" + decoy);
    }
  });

  const legend = document.createElement("aside");
  legend.id = "hash-guide-legend";
  legend.innerHTML =
    "<b>HASH İŞARETLERİ</b>" +
    "<span><i style='--dot:var(--guide-direct)'></i>P · görünür hash</span>" +
    "<span><i style='--dot:var(--guide-click)'></i>C · doğru tıklama</span>" +
    "<span><i style='--dot:var(--guide-decoy)'></i>F · sahte tıklama</span>" +
    (mixed ? "<span><i style='--dot:var(--guide-mixed)'></i>C/F · ortak aday</span>" : "");
  document.body.appendChild(legend);
})();
</script>`;

if (!fs.existsSync(sourceDir)) {
  throw new Error(`Oyun site klasörü bulunamadı: ${sourceDir}`);
}

fs.rmSync(previewDir, { recursive: true, force: true });
fs.mkdirSync(previewDir, { recursive: true });

const pages = [];
for (const siteEntry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
  if (!siteEntry.isDirectory()) continue;

  const siteId = siteEntry.name.toLowerCase();
  const siteName = canonicalNames[siteId];
  if (!siteName) continue;

  const sourceSiteDir = path.join(sourceDir, siteEntry.name);
  const outputSiteDir = path.join(previewDir, siteId);
  fs.mkdirSync(outputSiteDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceSiteDir, { withFileTypes: true })) {
    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".html") continue;

    const sourceFile = path.join(sourceSiteDir, entry.name);
    const html = fs.readFileSync(sourceFile, "utf8");
    const direct = countClass(html, "PTAG");
    const clickable = countClass(html, "CPTAG");
    const decoy = countClass(html, "CFTAG");
    const mixed = countMixed(html);
    if (!direct && !clickable && !decoy) continue;

    const pageId = path.basename(entry.name, path.extname(entry.name)).toLowerCase();
    const normalizedPageId = pageId.replaceAll("-", "");
    const pageName =
      pageNames[normalizedPageId] ??
      pageId
        .replaceAll("-", " ")
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
    const outputName = `${pageId}.html`;
    const outputFile = path.join(outputSiteDir, outputName);
    const baseHref = `../../../WTTGSD/Content/RawFiles/WebSites/${encodeURIComponent(siteEntry.name)}/`;
    const preview = injectPreview(html, baseHref);

    fs.writeFileSync(outputFile, preview, "utf8");
    pages.push({
      id: `${siteId}/${pageId}`,
      siteId,
      siteName,
      pageId,
      pageName,
      source: `WTTGSD/Content/RawFiles/WebSites/${siteEntry.name}/${entry.name}`,
      preview: `previews/${siteId}/${outputName}`,
      direct,
      clickable,
      decoy,
      mixed,
      uniqueMarkers: direct + clickable + decoy - mixed,
    });
  }
}

pages.sort((a, b) =>
  a.siteName.localeCompare(b.siteName, "en") ||
  (a.pageId === "index" ? -1 : b.pageId === "index" ? 1 : a.pageName.localeCompare(b.pageName, "tr")),
);

const sites = [...new Map(pages.map((page) => [page.siteId, {
  id: page.siteId,
  name: page.siteName,
}])).values()].map((site) => {
  const sitePages = pages.filter((page) => page.siteId === site.id);
  return {
    ...site,
    pageCount: sitePages.length,
    direct: sum(sitePages, "direct"),
    clickable: sum(sitePages, "clickable"),
    decoy: sum(sitePages, "decoy"),
    mixed: sum(sitePages, "mixed"),
  };
});

const data = {
  generatedAt: new Date().toISOString(),
  gameBuild: "24383809",
  sourceRoot: "WTTGSD/Content/RawFiles/WebSites",
  stats: {
    siteCount: sites.length,
    pageCount: pages.length,
    direct: sum(pages, "direct"),
    clickable: sum(pages, "clickable"),
    decoy: sum(pages, "decoy"),
    mixed: sum(pages, "mixed"),
    uniqueMarkers: sum(pages, "uniqueMarkers"),
  },
  sites,
  pages,
};

fs.writeFileSync(
  dataFile,
  `window.HASH_ATLAS_DATA = ${JSON.stringify(data, null, 2)};\n`,
  "utf8",
);

console.log(JSON.stringify(data.stats, null, 2));

function countClass(html, className) {
  const classPattern = /class\s*=\s*(["'])(.*?)\1/gis;
  let count = 0;
  for (const match of html.matchAll(classPattern)) {
    const classes = match[2].split(/\s+/);
    if (classes.includes(className)) count += 1;
  }
  return count;
}

function countMixed(html) {
  const classPattern = /class\s*=\s*(["'])(.*?)\1/gis;
  let count = 0;
  for (const match of html.matchAll(classPattern)) {
    const classes = match[2].split(/\s+/);
    if (classes.includes("CPTAG") && classes.includes("CFTAG")) count += 1;
  }
  return count;
}

function injectPreview(html, baseHref) {
  let output = html;
  const headInsert = `<base href="${baseHref}">\n${markerStyle}`;
  if (/<head[^>]*>/i.test(output)) {
    output = output.replace(/<head([^>]*)>/i, `<head$1>\n${headInsert}`);
  } else {
    output = `${headInsert}\n${output}`;
  }

  if (/<\/body>/i.test(output)) {
    return output.replace(/<\/body>/i, `${markerScript}\n</body>`);
  }
  return `${output}\n${markerScript}`;
}

function sum(records, key) {
  return records.reduce((total, record) => total + record[key], 0);
}

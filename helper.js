(() => {
  "use strict";

  const DATA = window.WTTG3_HELPER_DATA;
  const HELPER_CORE = window.WTTG3_HELPER_CORE;
  const SAVE_READER = window.WTTG3_SAVE_READER;
  const KEY_CORE = window.WTTG3_KEY_ORGANIZER_CORE;
  if (!DATA || !HELPER_CORE || !SAVE_READER || !KEY_CORE) return;

  const LANGUAGE_KEY = "wttg3-hash-atlas-language-v1";
  const SPOILER_KEY = "wttg3-helper-spoiler-v1";
  const NOTES_KEY = "wttg3-helper-notes-v1";
  const MINERS_KEY = "wttg3-helper-miners-v1";
  const LEVELS = { low: 0, hash: 1, full: 2 };
  const COPY = {
    tr: {
      helperLink: "Araçlar",
      helperEyebrow: "HELPER TOOLKIT",
      helperTitle: "Run araçları",
      helperDescription: "Saatleri, miner planını, run notlarını ve save verisini tek yerde tut.",
      spoilerLabel: "Spoiler seviyesi",
      spoilerLow: "Düşük",
      spoilerHash: "Hash",
      spoilerFull: "Tam",
      scheduleEyebrow: "SITE CLOCK",
      scheduleTitle: "Şimdi açık olanlar",
      gameTimeLabel: "Oyun saati",
      scheduleFilterLabel: "Göster",
      scheduleOpen: "Şimdi açık",
      scheduleTimed: "Saatli siteler",
      scheduleAlways: "Her zaman açık",
      scheduleAll: "Tümü",
      useSaveTime: "Save saatini kullan",
      scheduleSummary: "{minute}. dakikada {open} site açık. Sonraki değişim {next}.",
      scheduleAlwaysShort: "Her zaman",
      scheduleWindow: "{start} ile {end}",
      stateOpen: "Açık",
      stateClosed: "Kapalı",
      minerTitle: "Miner planlayıcı",
      minerTierLabel: "VirtMesh katmanı",
      minerMachine: "Makine",
      minerHardware: "Donanım",
      minerRate: "Referans hız",
      minerUnknown: "Bilinmiyor",
      minerNote: "Hızlar 1.0.5 sonrası topluluk ölçümüdür. Donanım listesi güncel oyun dosyasından alınmıştır.",
      minerTotalUnknown: "{total} DOS / min + {count} bilinmeyen",
      notesEyebrow: "RUN NOTES",
      notesTitle: "İzi kaybetme",
      notesPlaceholder: "Rota, kelime, site ve hatırlatıcılarını yaz...",
      notesExport: "Metin olarak indir",
      notesClear: "Temizle",
      notesLocal: "Notlar yalnızca bu tarayıcıda otomatik kaydedilir.",
      notesClearConfirm: "Run notları temizlensin mi?",
      fullSpoilerGate: "Save ayrıntıları Tam spoiler seviyesinde gizlenmez.",
      showFullSpoilers: "Tam spoilerı aç",
      hashSpoilerGate: "Hash araçları Hash spoiler seviyesinde gizlenmez.",
      showHashSpoilers: "Hash spoilerını aç",
      saveEyebrow: "LOCAL SAVE",
      saveTitle: "Save okuyucu",
      saveWaiting: "Bekliyor",
      saveReading: "Okunuyor",
      saveReady: "Hazır",
      saveError: "Hata",
      saveChoose: "WTTGSD_SaveGame.sav seç",
      savePrivacy: "Dosya tarayıcıdan çıkmaz ve hiçbir yere yüklenmez.",
      saveImportKeys: "8 çifti düzenleyiciye aktar",
      saveImported: "Save içindeki hash ve çözülmüş parçalar düzenleyiciye aktarıldı.",
      saveInvalid: "Dosya okunamadı: {message}",
      saveLoaded: "{name} yerel olarak okundu. Ham dosya saklanmadı.",
      saveTime: "Oyun saati",
      saveDos: "DOSCoin",
      saveSites: "Gezilen siteler",
      saveMiners: "Aktif miner",
      saveKeys: "Anahtar çifti",
      saveHours: "Kalan saat",
      resolverEyebrow: "SAVE BACKED",
      resolverTitle: "Hash çözümleyici",
      resolverInputLabel: "Şifreli hashler",
      resolverOutputLabel: "Çözülmüş parçalar",
      resolverInputPlaceholder: "1 - 1ef9d5b6\n2 - 2f45095a",
      resolverOutputPlaceholder: "1 - 36ea\n2 - 84be",
      resolverAction: "Eşleşenleri çöz",
      resolverCopy: "Çıktıyı kopyala",
      resolverNote: "WTTG3 değerleri her run'da değişir. Araç yalnızca yüklenen save veya düzenleyicideki doğrulanmış eşleşmeleri kullanır.",
      resolverEmpty: "İndeksli 8 karakterlik hash bulunamadı.",
      resolverResult: "{matched} / {total} hash doğrulanmış eşleşmeyle çözüldü.",
      resolverMissing: "eşleşme yok",
      resolverConflict: "çakışan girdi",
      resolverCopied: "Çıktı kopyalandı.",
    },
    en: {
      helperLink: "Tools",
      helperEyebrow: "HELPER TOOLKIT",
      helperTitle: "Run tools",
      helperDescription: "Keep site windows, miner planning, run notes, and local save data in one place.",
      spoilerLabel: "Spoiler level",
      spoilerLow: "Low",
      spoilerHash: "Hashes",
      spoilerFull: "Full",
      scheduleEyebrow: "SITE CLOCK",
      scheduleTitle: "Open right now",
      gameTimeLabel: "In-game time",
      scheduleFilterLabel: "Show",
      scheduleOpen: "Open now",
      scheduleTimed: "Timed sites",
      scheduleAlways: "Always open",
      scheduleAll: "All",
      useSaveTime: "Use save time",
      scheduleSummary: "At minute {minute}, {open} sites are open. Next change at {next}.",
      scheduleAlwaysShort: "Always",
      scheduleWindow: "{start} to {end}",
      stateOpen: "Open",
      stateClosed: "Closed",
      minerTitle: "Miner planner",
      minerTierLabel: "VirtMesh tier",
      minerMachine: "Machine",
      minerHardware: "Hardware",
      minerRate: "Reference rate",
      minerUnknown: "Unknown",
      minerNote: "Rates are community measurements from after 1.0.5. Hardware comes from the current game files.",
      minerTotalUnknown: "{total} DOS / min + {count} unknown",
      notesEyebrow: "RUN NOTES",
      notesTitle: "Keep the thread",
      notesPlaceholder: "Write routes, words, sites, and reminders...",
      notesExport: "Download text",
      notesClear: "Clear",
      notesLocal: "Notes are autosaved only in this browser.",
      notesClearConfirm: "Clear the run notes?",
      fullSpoilerGate: "Save details are revealed at the Full spoiler level.",
      showFullSpoilers: "Show full spoilers",
      hashSpoilerGate: "Hash tools are revealed at the Hash spoiler level.",
      showHashSpoilers: "Show hash spoilers",
      saveEyebrow: "LOCAL SAVE",
      saveTitle: "Save reader",
      saveWaiting: "Waiting",
      saveReading: "Reading",
      saveReady: "Ready",
      saveError: "Error",
      saveChoose: "Choose WTTGSD_SaveGame.sav",
      savePrivacy: "The file never leaves your browser and is not uploaded anywhere.",
      saveImportKeys: "Import 8 pairs into organizer",
      saveImported: "Hashes and decrypted fragments from the save were imported into the organizer.",
      saveInvalid: "The file could not be read: {message}",
      saveLoaded: "{name} was read locally. The raw file was not stored.",
      saveTime: "Game time",
      saveDos: "DOSCoin",
      saveSites: "Visited sites",
      saveMiners: "Active miners",
      saveKeys: "Key pairs",
      saveHours: "Hours left",
      resolverEyebrow: "SAVE BACKED",
      resolverTitle: "Hash resolver",
      resolverInputLabel: "Encrypted hashes",
      resolverOutputLabel: "Decrypted fragments",
      resolverInputPlaceholder: "1 - 1ef9d5b6\n2 - 2f45095a",
      resolverOutputPlaceholder: "1 - 36ea\n2 - 84be",
      resolverAction: "Resolve matches",
      resolverCopy: "Copy output",
      resolverNote: "WTTG3 values change each run. This tool uses only verified matches from the loaded save or organizer.",
      resolverEmpty: "No indexed 8 character hashes were found.",
      resolverResult: "{matched} / {total} hashes were resolved with verified matches.",
      resolverMissing: "no match",
      resolverConflict: "conflicting input",
      resolverCopied: "Output copied.",
    },
  };

  let language = getLanguage();
  let spoilerLevel = loadEnum(SPOILER_KEY, LEVELS, "hash");
  let activeTier = 1;
  let saveSnapshot = null;
  let selectedMiners = new Set(loadArray(MINERS_KEY));

  const gameTime = document.querySelector("#game-time");
  const scheduleFilter = document.querySelector("#schedule-filter");
  const runNotes = document.querySelector("#run-notes");
  const resolverInput = document.querySelector("#resolver-input");
  const resolverOutput = document.querySelector("#resolver-output");
  const saveSummary = document.querySelector("#save-summary");

  applyCopy();
  applySpoilers();
  runNotes.value = localStorage.getItem(NOTES_KEY) ?? "";
  updateNotesCount();
  renderSchedule();
  renderMiners();

  window.addEventListener("wttg3:languagechange", (event) => {
    language = event.detail?.language === "en" ? "en" : "tr";
    applyCopy();
    renderSchedule();
    renderMiners();
    if (saveSnapshot) renderSaveSummary();
  });

  document.querySelectorAll("[data-spoiler-level]").forEach((button) => {
    button.addEventListener("click", () => setSpoilerLevel(button.dataset.spoilerLevel));
  });
  document.querySelectorAll("[data-show-spoiler]").forEach((button) => {
    button.addEventListener("click", () => setSpoilerLevel(button.dataset.showSpoiler));
  });
  gameTime.addEventListener("input", renderSchedule);
  scheduleFilter.addEventListener("change", renderSchedule);
  document.querySelector("#use-save-time").addEventListener("click", () => {
    if (!saveSnapshot?.time) return;
    gameTime.value = saveSnapshot.time.label;
    renderSchedule();
  });
  document.querySelectorAll("[data-tier]").forEach((button) => {
    button.addEventListener("click", () => {
      activeTier = Number(button.dataset.tier);
      renderMiners();
    });
  });
  runNotes.addEventListener("input", () => {
    localStorage.setItem(NOTES_KEY, runNotes.value);
    updateNotesCount();
  });
  document.querySelector("#clear-notes").addEventListener("click", clearNotes);
  document.querySelector("#export-notes").addEventListener("click", exportNotes);
  document.querySelector("#save-file").addEventListener("change", readSaveFile);
  document.querySelector("#import-save-keys").addEventListener("click", importSaveKeys);
  document.querySelector("#resolve-hashes").addEventListener("click", resolveHashes);
  document.querySelector("#copy-resolved").addEventListener("click", copyResolved);

  function applyCopy() {
    document.querySelectorAll("[data-helper-i18n]").forEach((element) => {
      element.textContent = text(element.dataset.helperI18n);
    });
    document.querySelectorAll("[data-helper-i18n-placeholder]").forEach((element) => {
      element.setAttribute("placeholder", text(element.dataset.helperI18nPlaceholder));
    });
    document.querySelectorAll("[data-helper-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", text(element.dataset.helperI18nAriaLabel));
    });
    if (saveSnapshot) document.querySelector("#save-status").textContent = text("saveReady");
  }

  function setSpoilerLevel(level) {
    if (!(level in LEVELS)) return;
    spoilerLevel = level;
    localStorage.setItem(SPOILER_KEY, level);
    applySpoilers();
  }

  function applySpoilers() {
    document.documentElement.dataset.spoilerLevel = spoilerLevel;
    document.querySelectorAll("[data-spoiler-level]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.spoilerLevel === spoilerLevel));
    });
    document.querySelectorAll("[data-spoiler-min]").forEach((element) => {
      const hidden = LEVELS[spoilerLevel] < LEVELS[element.dataset.spoilerMin];
      element.classList.toggle("is-spoiler-hidden", hidden);
      element.querySelector(":scope > .spoiler-gate")?.toggleAttribute("hidden", !hidden);
    });
  }

  function renderSchedule() {
    const sites = currentAtlasData()?.sites ?? [];
    const minute = parseTime(gameTime.value).minute;
    const filter = scheduleFilter.value;
    const items = sites.map((site) => {
      const window = DATA.schedules[site.id];
      return { site, window, open: HELPER_CORE.isSiteOpen(window, minute) };
    });
    const openCount = items.filter((item) => item.open).length;
    const next = nextScheduleChange(items, gameTime.value);
    document.querySelector("#schedule-count").textContent = `${openCount} / ${sites.length}`;
    document.querySelector("#schedule-summary").textContent = format("scheduleSummary", {
      minute: String(minute).padStart(2, "0"),
      open: openCount,
      next,
    });

    const visible = items
      .filter((item) => {
        if (filter === "open") return item.open;
        if (filter === "timed") return Array.isArray(item.window);
        if (filter === "always") return item.window === null;
        return true;
      })
      .sort((left, right) => Number(right.open) - Number(left.open) || left.site.name.localeCompare(right.site.name, language));
    const root = document.querySelector("#schedule-list");
    root.replaceChildren(...visible.map(createScheduleItem));
  }

  function createScheduleItem(item) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `schedule-item${item.open ? " is-open" : ""}`;
    row.addEventListener("click", () => window.WTTG3_HASH_HELPER_BRIDGE?.focusSite(item.site.id));
    const identity = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = item.site.name;
    const windowLabel = document.createElement("small");
    windowLabel.textContent = Array.isArray(item.window)
      ? format("scheduleWindow", {
          start: `:${String(item.window[0]).padStart(2, "0")}`,
          end: `:${String(item.window[1]).padStart(2, "0")}`,
        })
      : text("scheduleAlwaysShort");
    identity.append(name, windowLabel);
    const state = document.createElement("span");
    state.className = "schedule-item__state";
    state.textContent = text(item.open ? "stateOpen" : "stateClosed");
    row.append(identity, state);
    return row;
  }

  function renderMiners() {
    document.querySelectorAll("[data-tier]").forEach((button) => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.tier) === activeTier));
    });
    const miners = DATA.miners
      .filter((miner) => miner.tier === activeTier)
      .sort((left, right) => (right.rate ?? -1) - (left.rate ?? -1));
    const root = document.querySelector("#miner-list");
    root.replaceChildren(...miners.map(createMinerRow));
    updateMinerTotal();
  }

  function createMinerRow(miner) {
    const label = document.createElement("label");
    label.className = "miner-row";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selectedMiners.has(miner.name);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) selectedMiners.add(miner.name);
      else selectedMiners.delete(miner.name);
      localStorage.setItem(MINERS_KEY, JSON.stringify([...selectedMiners]));
      updateMinerTotal();
    });
    const name = document.createElement("strong");
    name.textContent = miner.name;
    const hardware = document.createElement("small");
    hardware.textContent = `${formatMemory(miner.memory)} · ${miner.cpu.toFixed(1)} GHz · ${miner.gpu}`;
    const rate = document.createElement("output");
    rate.textContent = miner.rate === null ? text("minerUnknown") : miner.rate.toFixed(2);
    rate.classList.toggle("is-unknown", miner.rate === null);
    label.append(checkbox, name, hardware, rate);
    return label;
  }

  function updateMinerTotal() {
    const result = HELPER_CORE.calculateMinerTotal(DATA.miners, selectedMiners);
    const total = result.total.toFixed(2);
    const unknown = result.unknown;
    document.querySelector("#miner-total").textContent = unknown
      ? format("minerTotalUnknown", { total, count: unknown })
      : `${total} DOS / min`;
  }

  async function readSaveFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const status = document.querySelector("#save-status");
    const feedback = document.querySelector("#save-feedback");
    status.textContent = text("saveReading");
    feedback.textContent = "";
    try {
      if (file.size > SAVE_READER.MAX_FILE_SIZE) throw new Error("File is larger than 64 MB");
      const saveDocument = SAVE_READER.parseSave(await file.arrayBuffer(), file.name);
      saveSnapshot = SAVE_READER.extractHelperSnapshot(saveDocument);
      status.textContent = text("saveReady");
      feedback.textContent = format("saveLoaded", { name: file.name });
      document.querySelector("#import-save-keys").disabled =
        !saveSnapshot.keyPairs.every((pair) => pair.encrypted && pair.decrypted);
      document.querySelector("#use-save-time").disabled = !saveSnapshot.time;
      selectImportedMiners(saveSnapshot.minerNames);
      renderSaveSummary();
      if (resolverInput.value.trim()) resolveHashes();
    } catch (error) {
      saveSnapshot = null;
      status.textContent = text("saveError");
      feedback.textContent = format("saveInvalid", {
        message: error instanceof Error ? error.message : String(error),
      });
      saveSummary.hidden = true;
      document.querySelector("#import-save-keys").disabled = true;
      document.querySelector("#use-save-time").disabled = true;
    }
  }

  function renderSaveSummary() {
    if (!saveSnapshot) return;
    const values = [
      ["saveTime", saveSnapshot.time?.label ?? "?"],
      ["saveDos", saveSnapshot.dosCoin === null ? "?" : saveSnapshot.dosCoin.toFixed(2)],
      ["saveSites", `${saveSnapshot.sites.visited} / ${saveSnapshot.sites.total}`],
      ["saveMiners", String(saveSnapshot.minerNames.length)],
      ["saveKeys", `${saveSnapshot.keyPairs.filter((pair) => pair.encrypted && pair.decrypted).length} / 8`],
      ["saveHours", saveSnapshot.hoursLeft === null ? "?" : String(saveSnapshot.hoursLeft)],
    ];
    saveSummary.replaceChildren(
      ...values.map(([label, value]) => {
        const item = document.createElement("div");
        const small = document.createElement("small");
        const strong = document.createElement("strong");
        small.textContent = text(label);
        strong.textContent = value;
        item.append(small, strong);
        return item;
      }),
    );
    saveSummary.hidden = false;
  }

  function selectImportedMiners(names) {
    selectedMiners = new Set(HELPER_CORE.matchMinerNames(DATA.miners, names));
    localStorage.setItem(MINERS_KEY, JSON.stringify([...selectedMiners]));
    renderMiners();
  }

  function importSaveKeys() {
    if (!saveSnapshot) return;
    const imported = window.WTTG3_HASH_HELPER_BRIDGE?.importKeyPairs(saveSnapshot.keyPairs);
    document.querySelector("#save-feedback").textContent = imported
      ? text("saveImported")
      : format("saveInvalid", { message: "Organizer bridge unavailable" });
  }

  function resolveHashes() {
    const organizer = window.WTTG3_HASH_HELPER_BRIDGE?.getKeyState?.() ?? [];
    const result = HELPER_CORE.resolveIndexedHashes(
      resolverInput.value,
      KEY_CORE,
      [...organizer, ...(saveSnapshot?.keyPairs ?? [])],
      { missing: text("resolverMissing"), conflict: text("resolverConflict") },
    );
    if (!result.total) {
      resolverOutput.value = "";
      document.querySelector("#resolver-status").textContent = "0 / 0";
      document.querySelector("#copy-resolved").disabled = true;
      document.querySelector("#resolver-feedback").textContent = text("resolverEmpty");
      return;
    }

    resolverOutput.value = result.lines.join("\n");
    document.querySelector("#resolver-status").textContent = `${result.matched} / ${result.total}`;
    document.querySelector("#copy-resolved").disabled = result.matched === 0;
    document.querySelector("#resolver-feedback").textContent = format("resolverResult", {
      matched: result.matched,
      total: result.total,
    });
  }

  async function copyResolved() {
    if (!resolverOutput.value) return;
    await writeClipboard(resolverOutput.value);
    document.querySelector("#resolver-feedback").textContent = text("resolverCopied");
  }

  function updateNotesCount() {
    document.querySelector("#notes-count").textContent = runNotes.value.length.toLocaleString(language === "tr" ? "tr-TR" : "en-US");
  }

  function clearNotes() {
    if (!runNotes.value || !window.confirm(text("notesClearConfirm"))) return;
    runNotes.value = "";
    localStorage.removeItem(NOTES_KEY);
    updateNotesCount();
  }

  function exportNotes() {
    const blob = new Blob([runNotes.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wttg3-run-notes.txt";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function currentAtlasData() {
    return language === "en" ? window.HASH_ATLAS_DATA_EN : window.HASH_ATLAS_DATA;
  }

  function parseTime(value) {
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    return match
      ? { hour: Number(match[1]), minute: Number(match[2]) }
      : { hour: 0, minute: 0 };
  }

  function nextScheduleChange(items, value) {
    const { hour, minute } = parseTime(value);
    const delta = HELPER_CORE.getNextChangeDelta(
      items.map((item) => item.window),
      minute,
    );
    const absolute = hour * 60 + minute + delta;
    return `${String(Math.floor(absolute / 60) % 24).padStart(2, "0")}:${String(absolute % 60).padStart(2, "0")}`;
  }

  function formatMemory(megabytes) {
    return megabytes >= 1024 ? `${Number((megabytes / 1024).toFixed(1))} GB` : `${megabytes} MB`;
  }

  function getLanguage() {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored === "tr" || stored === "en") return stored;
    return navigator.language?.toLowerCase().startsWith("tr") ? "tr" : "en";
  }

  function loadArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) ?? "[]");
      return Array.isArray(value) ? value.filter((entry) => typeof entry === "string") : [];
    } catch {
      return [];
    }
  }

  function loadEnum(key, values, fallback) {
    const value = localStorage.getItem(key);
    return value && value in values ? value : fallback;
  }

  function text(key) {
    return COPY[language]?.[key] ?? COPY.tr[key] ?? key;
  }

  function format(key, values) {
    return Object.entries(values).reduce(
      (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
      text(key),
    );
  }

  async function writeClipboard(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const helper = document.createElement("textarea");
    helper.value = value;
    helper.readOnly = true;
    helper.className = "sr-only";
    document.body.append(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    if (!copied) throw new Error("Clipboard unavailable");
  }
})();

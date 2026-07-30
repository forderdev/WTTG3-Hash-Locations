(() => {
  document.documentElement.classList.add("has-js");

  const DATA_BY_LANGUAGE = {
    tr: window.HASH_ATLAS_DATA,
    en: window.HASH_ATLAS_DATA_EN,
  };
  const KEY_CORE = window.WTTG3_KEY_ORGANIZER_CORE;

  if (!DATA_BY_LANGUAGE.tr || !DATA_BY_LANGUAGE.en || !KEY_CORE) {
    document.body.innerHTML =
      '<main style="padding:40px;font-family:sans-serif"><h1>Gerekli dosyalar bulunamadı</h1><p>Veri ve anahtar düzenleyici dosyalarını kontrol et.</p></main>';
    return;
  }

  const COPY = {
    tr: {
      documentTitle: "WTTG III | Hash Bulma",
      description: "hash bulma",
      homeAria: "Başa dön",
      wordmark: "Hash Bulma",
      language: "Dil",
      sectionNav: "Sayfa bölümleri",
      keyOrganizerLink: "Anahtar düzenleyici",
      archiveLink: "Arşive git",
      heroTitle: "WTTG3 hash bulma işi",
      heroLede: "hash bulun",
      statsAria: "Veri kapsamı",
      statsTitle: "Siteler:",
      siteUnit: "site",
      pageUnit: "sayfa",
      markerUnit: "işaret",
      legendTitle: "önemli",
      legendIntro: "her renk farklı bir hash konumu tipini gösterir.",
      keyOrganizerTitle: "Anahtar düzenleyici",
      keyOrganizerDescription:
        "Bulduğun hashleri ve ajanlardan gelen çözülmüş parçaları indeks sırasına yerleştir.",
      keyFoundProgress: "Bulunan",
      keyDecryptedProgress: "Çözülen",
      keyWikiProgress: "Wiki 1 / 2 / 3",
      keyWikiDistributionWarning:
        "Bir Wiki'ye üçten fazla anahtar atandı. Bu yalnızca kontrol uyarısıdır.",
      keyPasteLabel: "Hızlı ekle",
      keyPasteHint:
        "Oyun sayfasından veya CryptChat'ten kopyaladığın indeksli satırları yapıştır.",
      keyPastePlaceholder: "1 - 2bfc88a4\n1 - a9f2",
      keyParseAction: "Anahtarları yerleştir",
      keyParseEmpty:
        "İndeksli 8 veya 4 karakterlik bir parça bulunamadı.",
      keyParseSuccess: "{count} alan yerleştirildi.",
      keyParseConflict:
        "Aynı indeks için çakışan değer değişmeden bırakıldı.",
      keyParseNoChange: "Yerleştirilecek yeni bir değer bulunamadı.",
      keyEncryptedLabel: "Bulunan hash",
      keyDecryptedLabel: "Çözülmüş parça",
      keyWikiLabel: "Wiki",
      keyWikiUnknown: "Seçilmedi",
      keyStatusLabel: "Durum",
      keyRowsAria: "Sekiz anahtar yuvası",
      keyFieldHashShort: "Hash",
      keyFieldDecryptedShort: "Çözülmüş",
      keyFieldWikiShort: "Wiki",
      keyEncryptedAria: "{index}. anahtarın 8 karakterlik bulunan hash'i",
      keyDecryptedAria: "{index}. anahtarın 4 karakterlik çözülmüş parçası",
      keyWikiAria: "{index}. anahtarın bulunduğu Wiki",
      keyStatusEmpty: "Boş",
      keyStatusFound: "Bulundu",
      keyStatusDecrypted: "Çözüldü",
      masterKeyLabel: "Master key",
      masterKeyHint:
        "Sekiz çözülmüş parça indeks sırasıyla otomatik birleşir.",
      copyMasterKey: "Master key'i kopyala",
      masterKeyCopied: "Kopyalandı",
      masterKeyCopyFailed: "Kopyalanamadı",
      resetKeys: "Anahtarları sıfırla",
      resetKeysConfirm: "Kaydedilen tüm anahtarlar silinsin mi?",
      keyRandomNote:
        "Şifreli ve çözülmüş değerler her oyunda değişir. Kayıtlar yalnızca bu tarayıcıda tutulur.",
      directTitle: "Görünür konum",
      directDescription: "Hash metninin doğrudan yazılabileceği boş alan.",
      clickableTitle: "Tıklanabilir konum",
      clickableDescription:
        "İmleç değiştiğinde hash verebilen doğru tıklama adayı.",
      decoyTitle: "Sahte konum",
      decoyDescription: "Doğru adayın ipucunu taklit edebilen tuzak nokta.",
      atlasTitle: "Site ve sayfalar",
      atlasDescription:
        "Bir siteyi açarak sayfalarını ve işaret türlerini incele.",
      progress: "İlerleme",
      searchLabel: "Site veya sayfa ara",
      searchPlaceholder: "Örnek: Shadow Web",
      typeLabel: "Konum türü",
      typeFilterAria: "Konum türü filtresi",
      filterAll: "Tümü",
      filterDirect: "Görünür",
      filterClickable: "Tıklanabilir",
      filterDecoy: "Tuzaklı",
      hideChecked: "Bakılanları gizle",
      loading: "Veriler hazırlanıyor.",
      empty: "Bu filtrelerle eşleşen sayfa bulunamadı.",
      footer: "Oyun dosyalarından yerel olarak üretildi. Resmî değildir.",
      reset: "İlerlemeyi sıfırla",
      openNewTab: "Yeni sekmede aç",
      close: "Kapat",
      iframeTitle: "İşaretlenmiş oyun sayfası",
      markReviewed: "Bakıldı olarak işaretle",
      previewAction: "Ön izle",
      resetConfirm: "Bakıldı işaretlerinin tümü silinsin mi?",
      reviewed: "bakıldı",
      pageSingular: "sayfa",
      pagePlural: "sayfa",
      directVerbose: "görünür konum",
      clickableVerbose: "doğru tıklama",
      decoyVerbose: "sahte tıklama",
    },
    en: {
      documentTitle: "WTTG III | Hash Finder",
      description:
        "Find every hash location in Welcome to the Game III.",
      homeAria: "Back to top",
      wordmark: "Hash Finder",
      language: "Language",
      sectionNav: "Page sections",
      keyOrganizerLink: "Key organizer",
      archiveLink: "Browse archive",
      heroTitle: "WTTG3 hash finder",
      heroLede: "find every hash location",
      statsAria: "Archive coverage",
      statsTitle: "Archive:",
      siteUnit: "sites",
      pageUnit: "pages",
      markerUnit: "markers",
      legendTitle: "important",
      legendIntro: "each color represents a different hash location type.",
      keyOrganizerTitle: "Key organizer",
      keyOrganizerDescription:
        "Place found hashes and decrypted fragments from agents in index order.",
      keyFoundProgress: "Found",
      keyDecryptedProgress: "Decrypted",
      keyWikiProgress: "Wiki 1 / 2 / 3",
      keyWikiDistributionWarning:
        "More than three keys are assigned to one Wiki. This is only a review warning.",
      keyPasteLabel: "Quick add",
      keyPasteHint:
        "Paste indexed lines copied from a game page or CryptChat.",
      keyPastePlaceholder: "1 - 2bfc88a4\n1 - a9f2",
      keyParseAction: "Place keys",
      keyParseEmpty:
        "No indexed 8 or 4 character fragment was found.",
      keyParseSuccess: "{count} fields placed.",
      keyParseConflict:
        "A conflicting value for the same index was left unchanged.",
      keyParseNoChange: "No new value was available to place.",
      keyEncryptedLabel: "Found hash",
      keyDecryptedLabel: "Decrypted fragment",
      keyWikiLabel: "Wiki",
      keyWikiUnknown: "Not selected",
      keyStatusLabel: "Status",
      keyRowsAria: "Eight key slots",
      keyFieldHashShort: "Hash",
      keyFieldDecryptedShort: "Decrypted",
      keyFieldWikiShort: "Wiki",
      keyEncryptedAria: "Found 8 character hash for key {index}",
      keyDecryptedAria: "Decrypted 4 character fragment for key {index}",
      keyWikiAria: "Wiki where key {index} was found",
      keyStatusEmpty: "Empty",
      keyStatusFound: "Found",
      keyStatusDecrypted: "Decrypted",
      masterKeyLabel: "Master key",
      masterKeyHint:
        "Eight decrypted fragments join automatically in index order.",
      copyMasterKey: "Copy master key",
      masterKeyCopied: "Copied",
      masterKeyCopyFailed: "Copy failed",
      resetKeys: "Reset keys",
      resetKeysConfirm: "Clear every saved key?",
      keyRandomNote:
        "Encrypted and decrypted values change every game. Entries are stored only in this browser.",
      directTitle: "Visible location",
      directDescription: "An empty field where the hash can appear directly.",
      clickableTitle: "Clickable location",
      clickableDescription:
        "A valid click target that may reveal a hash when the cursor changes.",
      decoyTitle: "Decoy location",
      decoyDescription:
        "A decoy point that can mimic the hint of a valid target.",
      atlasTitle: "Sites and pages",
      atlasDescription:
        "Open a site to inspect its pages and marker types.",
      progress: "Progress",
      searchLabel: "Search sites or pages",
      searchPlaceholder: "Example: Shadow Web",
      typeLabel: "Location type",
      typeFilterAria: "Location type filter",
      filterAll: "All",
      filterDirect: "Visible",
      filterClickable: "Clickable",
      filterDecoy: "Decoys",
      hideChecked: "Hide reviewed",
      loading: "Preparing archive.",
      empty: "No pages match these filters.",
      footer: "Generated locally from the original game files. Unofficial.",
      reset: "Reset progress",
      openNewTab: "Open in new tab",
      close: "Close",
      iframeTitle: "Marked game page",
      markReviewed: "Mark as reviewed",
      previewAction: "Preview",
      resetConfirm: "Clear every reviewed marker?",
      reviewed: "reviewed",
      pageSingular: "page",
      pagePlural: "pages",
      directVerbose: "visible location",
      clickableVerbose: "correct click",
      decoyVerbose: "decoy click",
    },
  };

  const STORAGE_KEY = "wttg3-hash-atlas-progress-v1";
  const LANGUAGE_KEY = "wttg3-hash-atlas-language-v1";
  const KEY_STORAGE_KEY = "wttg3-key-organizer-v1";
  const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
  let currentLanguage =
    savedLanguage === "tr" || savedLanguage === "en"
      ? savedLanguage
      : detectBrowserLanguage();
  let data = DATA_BY_LANGUAGE[currentLanguage];
  let activeFilter = "all";

  const siteList = document.querySelector("#site-list");
  const siteTemplate = document.querySelector("#site-template");
  const pageTemplate = document.querySelector("#page-template");
  const searchInput = document.querySelector("#search-input");
  const hideCheckedInput = document.querySelector("#hide-checked");
  const emptyState = document.querySelector("#empty-state");
  const dialog = document.querySelector("#preview-dialog");
  const previewFrame = document.querySelector("#preview-frame");
  const previewSite = document.querySelector("#preview-site");
  const previewTitle = document.querySelector("#preview-title");
  const previewPath = document.querySelector("#preview-path");
  const previewBadges = document.querySelector("#preview-badges");
  const previewOpen = document.querySelector("#preview-open");
  const checkedPages = new Set(loadProgress());
  const keyRows = document.querySelector("#key-rows");
  const keyRowTemplate = document.querySelector("#key-row-template");
  const keyBulkInput = document.querySelector("#key-bulk-input");
  const keyParseFeedback = document.querySelector("#key-parse-feedback");
  const masterKeyOutput = document.querySelector("#master-key-output");
  const copyMasterKeyButton = document.querySelector("#copy-master-key");
  let keyState = loadKeyState();
  let copyFeedbackTimer = null;

  renderKeyRows();
  applyTranslations();
  updateStats();
  renderSites();
  updateProgress();
  updateKeyOrganizer();
  setupReveals();

  searchInput.addEventListener("input", applyFilters);
  hideCheckedInput.addEventListener("change", applyFilters);

  document.querySelectorAll(".filter").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(".filter.is-active")?.classList.remove("is-active");
      button.classList.add("is-active");
      activeFilter = button.dataset.filter;
      applyFilters();
    });
  });

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      const language = button.dataset.language;
      if (!DATA_BY_LANGUAGE[language] || language === currentLanguage) return;

      closePreview();
      currentLanguage = language;
      data = DATA_BY_LANGUAGE[currentLanguage];
      localStorage.setItem(LANGUAGE_KEY, currentLanguage);
      applyTranslations();
      updateStats();
      renderSites();
      updateProgress();
      applyFilters();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "/" &&
      document.activeElement !== searchInput &&
      !dialog.open
    ) {
      event.preventDefault();
      searchInput.focus();
    }
  });

  document.querySelector("#preview-close").addEventListener("click", closePreview);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closePreview();
  });
  dialog.addEventListener("close", () => {
    previewFrame.src = "about:blank";
  });

  document.querySelector("#reset-progress").addEventListener("click", () => {
    if (!checkedPages.size) return;
    if (!window.confirm(t("resetConfirm"))) return;
    checkedPages.clear();
    saveProgress();
    document.querySelectorAll(".page-check input").forEach((input) => {
      input.checked = false;
    });
    updateProgress();
    applyFilters();
  });

  document.querySelector("#key-parse").addEventListener("click", parseKeyPaste);
  copyMasterKeyButton.addEventListener("click", copyMasterKey);
  document
    .querySelector("#reset-key-organizer")
    .addEventListener("click", resetKeyOrganizer);

  function applyTranslations() {
    document.documentElement.lang = currentLanguage;
    document.title = t("documentTitle");
    document
      .querySelector("#meta-description")
      .setAttribute("content", t("description"));

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.setAttribute(
        "placeholder",
        t(element.dataset.i18nPlaceholder),
      );
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute(
        "aria-label",
        t(element.dataset.i18nAriaLabel),
      );
    });
    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
      element.setAttribute("title", t(element.dataset.i18nTitle));
    });
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.language === currentLanguage),
      );
    });
    updateKeyOrganizerTranslations();
  }

  function renderKeyRows() {
    keyRows.replaceChildren();

    for (let slot = 0; slot < KEY_CORE.SLOT_COUNT; slot += 1) {
      const fragment = keyRowTemplate.content.cloneNode(true);
      const row = fragment.querySelector(".key-row");
      const encryptedInput = fragment.querySelector(
        ".key-field__input--encrypted",
      );
      const decryptedInput = fragment.querySelector(
        ".key-field__input--decrypted",
      );
      const wikiSelect = fragment.querySelector(".key-field__select");

      row.dataset.keyIndex = String(slot + 1);
      fragment.querySelector(".key-row__index").textContent = String(
        slot + 1,
      ).padStart(2, "0");
      encryptedInput.value = keyState[slot].encrypted;
      decryptedInput.value = keyState[slot].decrypted;
      wikiSelect.value = keyState[slot].wiki ?? "";

      encryptedInput.addEventListener("input", () => {
        updateKeyField(slot, "encrypted", encryptedInput);
      });
      decryptedInput.addEventListener("input", () => {
        updateKeyField(slot, "decrypted", decryptedInput);
      });
      encryptedInput.addEventListener("blur", () => {
        normalizeKeyField(slot, "encrypted", encryptedInput);
      });
      decryptedInput.addEventListener("blur", () => {
        normalizeKeyField(slot, "decrypted", decryptedInput);
      });
      wikiSelect.addEventListener("change", () => {
        keyState[slot].wiki = wikiSelect.value
          ? Number(wikiSelect.value)
          : null;
        saveKeyState();
        updateKeyOrganizer();
      });

      keyRows.append(fragment);
    }
  }

  function updateKeyField(slot, type, input) {
    const length =
      type === "encrypted"
        ? KEY_CORE.ENCRYPTED_LENGTH
        : KEY_CORE.DECRYPTED_LENGTH;
    const parsed = KEY_CORE.parseSingleHex(input.value, length);
    const indexed = KEY_CORE.parseIndexedFragments(input.value);
    const indexedForType = indexed.entries.filter((entry) => entry[type]);
    const wrongIndex =
      indexedForType.length > 0 &&
      !indexedForType.some((entry) =>
        entry.index === slot + 1 && entry[type] === parsed.value
      );
    const isValid = parsed.status === "valid" && !wrongIndex;
    const isEmpty = parsed.status === "empty";

    input.setAttribute(
      "aria-invalid",
      String(!isValid && !isEmpty),
    );
    keyState[slot][type] = isValid ? parsed.value : "";
    saveKeyState();
    updateKeyOrganizer();
  }

  function normalizeKeyField(slot, type, input) {
    if (keyState[slot][type]) input.value = keyState[slot][type];
  }

  function parseKeyPaste() {
    const parsed = KEY_CORE.parseIndexedFragments(keyBulkInput.value);
    let blocked = parsed.conflicts.length;
    let updated = 0;

    for (const entry of parsed.entries) {
      const target = keyState[entry.index - 1];
      for (const type of ["encrypted", "decrypted"]) {
        const incoming = entry[type];
        if (!incoming) continue;
        if (target[type] && target[type] !== incoming) {
          blocked += 1;
          continue;
        }
        if (target[type] !== incoming) {
          target[type] = incoming;
          updated += 1;
        }
      }
    }

    if (updated) {
      saveKeyState();
      syncKeyRows();
      updateKeyOrganizer();
    }

    if (!parsed.entries.length && !parsed.conflicts.length) {
      setKeyFeedback(t("keyParseEmpty"), true);
      return;
    }

    if (blocked) {
      const success = updated
        ? `${formatCopy("keyParseSuccess", { count: updated })} `
        : "";
      setKeyFeedback(`${success}${t("keyParseConflict")}`, true);
      return;
    }

    if (!updated) {
      setKeyFeedback(t("keyParseNoChange"));
      return;
    }

    keyBulkInput.value = "";
    setKeyFeedback(formatCopy("keyParseSuccess", { count: updated }));
  }

  function setKeyFeedback(message, isError = false) {
    keyParseFeedback.textContent = message;
    keyParseFeedback.classList.toggle("is-error", isError);
  }

  function syncKeyRows() {
    keyRows.querySelectorAll(".key-row").forEach((row, slot) => {
      const encryptedInput = row.querySelector(
        ".key-field__input--encrypted",
      );
      const decryptedInput = row.querySelector(
        ".key-field__input--decrypted",
      );
      encryptedInput.value = keyState[slot].encrypted;
      decryptedInput.value = keyState[slot].decrypted;
      encryptedInput.setAttribute("aria-invalid", "false");
      decryptedInput.setAttribute("aria-invalid", "false");
      row.querySelector(".key-field__select").value =
        keyState[slot].wiki ?? "";
    });
  }

  function updateKeyOrganizer() {
    const progress = KEY_CORE.getProgress(keyState);
    const masterKey = KEY_CORE.getMasterKey(keyState);
    const wikiCounts = [1, 2, 3].map((wiki) =>
      keyState.filter((entry) => entry.wiki === wiki).length
    );
    const wikiCountOutput = document.querySelector("#key-wiki-counts");

    document.querySelector("#key-found-count").textContent =
      `${progress.found} / ${KEY_CORE.SLOT_COUNT}`;
    document.querySelector("#key-decrypted-count").textContent =
      `${progress.decrypted} / ${KEY_CORE.SLOT_COUNT}`;
    wikiCountOutput.textContent = wikiCounts.join(" / ");
    wikiCountOutput.classList.toggle(
      "has-warning",
      wikiCounts.some((count) => count > 3),
    );
    if (wikiCounts.some((count) => count > 3)) {
      wikiCountOutput.setAttribute(
        "title",
        t("keyWikiDistributionWarning"),
      );
    } else {
      wikiCountOutput.removeAttribute("title");
    }
    masterKeyOutput.textContent = KEY_CORE.getMasterPreview(keyState);
    masterKeyOutput.classList.toggle("is-complete", Boolean(masterKey));
    copyMasterKeyButton.disabled = !masterKey;

    keyRows.querySelectorAll(".key-row").forEach((row, slot) => {
      const status = row.querySelector(".key-row__status");
      status.classList.remove("is-found", "is-decrypted");

      if (keyState[slot].decrypted) {
        status.textContent = t("keyStatusDecrypted");
        status.classList.add("is-decrypted");
      } else if (keyState[slot].encrypted) {
        status.textContent = t("keyStatusFound");
        status.classList.add("is-found");
      } else {
        status.textContent = t("keyStatusEmpty");
      }
    });
  }

  function updateKeyOrganizerTranslations() {
    keyRows.querySelectorAll(".key-row").forEach((row) => {
      const index = row.dataset.keyIndex;
      const fields = row.querySelectorAll(".key-field");
      const labels = row.querySelectorAll(".key-field__label");
      const visualLabels = row.querySelectorAll(
        ".key-field__visual-label",
      );
      const encryptedInput = row.querySelector(
        ".key-field__input--encrypted",
      );
      const decryptedInput = row.querySelector(
        ".key-field__input--decrypted",
      );
      const wikiSelect = row.querySelector(".key-field__select");

      labels[0].textContent = formatCopy("keyEncryptedAria", { index });
      labels[1].textContent = formatCopy("keyDecryptedAria", { index });
      labels[2].textContent = formatCopy("keyWikiAria", { index });
      visualLabels[0].textContent = t("keyFieldHashShort");
      visualLabels[1].textContent = t("keyFieldDecryptedShort");
      visualLabels[2].textContent = t("keyFieldWikiShort");
      encryptedInput.setAttribute(
        "aria-label",
        formatCopy("keyEncryptedAria", { index }),
      );
      decryptedInput.setAttribute(
        "aria-label",
        formatCopy("keyDecryptedAria", { index }),
      );
      wikiSelect.setAttribute(
        "aria-label",
        formatCopy("keyWikiAria", { index }),
      );
      fields.forEach((field) => field.setAttribute("lang", currentLanguage));
    });

    setKeyFeedback("");
    updateKeyOrganizer();
  }

  async function copyMasterKey() {
    const masterKey = KEY_CORE.getMasterKey(keyState);
    if (!masterKey) return;

    const label = copyMasterKeyButton.querySelector("span");
    window.clearTimeout(copyFeedbackTimer);

    try {
      await writeClipboard(masterKey);
      label.textContent = t("masterKeyCopied");
    } catch {
      label.textContent = t("masterKeyCopyFailed");
    }

    copyFeedbackTimer = window.setTimeout(() => {
      label.textContent = t("copyMasterKey");
    }, 1600);
  }

  async function writeClipboard(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.className = "sr-only";
    document.body.append(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    if (!copied) throw new Error("Clipboard unavailable");
  }

  function resetKeyOrganizer() {
    const hasValues = keyState.some((entry) =>
      entry.encrypted || entry.decrypted || entry.wiki
    );
    if (!hasValues) return;
    if (!window.confirm(t("resetKeysConfirm"))) return;

    keyState = KEY_CORE.createEmptyState();
    saveKeyState();
    syncKeyRows();
    setKeyFeedback("");
    updateKeyOrganizer();
  }

  function updateStats() {
    document.querySelector("#site-count").textContent =
      data.stats.siteCount.toLocaleString(numberLocale());
    document.querySelector("#page-count").textContent =
      data.stats.pageCount.toLocaleString(numberLocale());
    document.querySelector("#marker-count").textContent =
      data.stats.uniqueMarkers.toLocaleString(numberLocale());
  }

  function renderSites() {
    siteList.replaceChildren();
    const grouped = new Map();
    data.pages.forEach((page) => {
      if (!grouped.has(page.siteId)) grouped.set(page.siteId, []);
      grouped.get(page.siteId).push(page);
    });

    data.sites.forEach((site, index) => {
      const siteFragment = siteTemplate.content.cloneNode(true);
      const card = siteFragment.querySelector(".site-card");
      const toggle = siteFragment.querySelector(".site-card__toggle");
      const pagesRoot = siteFragment.querySelector(".site-card__pages");
      const sitePages = grouped.get(site.id) ?? [];

      card.dataset.siteId = site.id;
      card.dataset.search = normalize(
        `${site.name} ${sitePages.map((page) => page.pageName).join(" ")}`,
      );
      siteFragment.querySelector(".site-card__index").textContent = String(
        index + 1,
      ).padStart(2, "0");
      siteFragment.querySelector(".site-card__identity strong").textContent =
        site.name;
      siteFragment.querySelector(".site-card__identity small").textContent =
        pageCountLabel(site.pageCount);
      siteFragment.querySelector(".site-card__counts").textContent =
        `${site.direct} P / ${site.clickable} C / ${site.decoy} F`;

      toggle.addEventListener("click", () => {
        const isOpen = card.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });

      sitePages.forEach((page) => {
        const pageFragment = pageTemplate.content.cloneNode(true);
        const row = pageFragment.querySelector(".page-row");
        const checkbox = pageFragment.querySelector(".page-check input");
        const openButton = pageFragment.querySelector(".page-row__open");

        row.dataset.pageId = page.id;
        row.dataset.search = normalize(
          `${site.name} ${page.pageName} ${page.pageId}`,
        );
        row.dataset.direct = String(page.direct > 0);
        row.dataset.clickable = String(page.clickable > 0);
        row.dataset.decoy = String(page.decoy > 0);
        pageFragment.querySelector(".page-row__open strong").textContent =
          page.pageName;
        pageFragment.querySelector(".page-row__open small").textContent =
          page.pageId === "index" ? "index.html" : `${page.pageId}.html`;
        pageFragment.querySelector(".marker-badges").append(
          ...createBadges(page),
        );
        pageFragment.querySelector(".sr-only").textContent =
          t("markReviewed");
        pageFragment.querySelector(".page-row__action").textContent =
          t("previewAction");

        checkbox.checked = checkedPages.has(page.id);
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) checkedPages.add(page.id);
          else checkedPages.delete(page.id);
          saveProgress();
          updateProgress();
          if (hideCheckedInput.checked) applyFilters();
        });

        openButton.addEventListener("click", () => openPreview(page));
        pagesRoot.append(pageFragment);
      });

      siteList.append(siteFragment);
    });
  }

  function applyFilters() {
    const query = normalize(searchInput.value);
    let visibleSiteCount = 0;

    document.querySelectorAll(".site-card").forEach((card) => {
      let visiblePageCount = 0;
      card.querySelectorAll(".page-row").forEach((row) => {
        const matchesQuery = !query || row.dataset.search.includes(query);
        const matchesType =
          activeFilter === "all" || row.dataset[activeFilter] === "true";
        const matchesChecked =
          !hideCheckedInput.checked || !checkedPages.has(row.dataset.pageId);
        const visible = matchesQuery && matchesType && matchesChecked;
        row.hidden = !visible;
        if (visible) visiblePageCount += 1;
      });

      card.hidden = visiblePageCount === 0;
      if (visiblePageCount) {
        visibleSiteCount += 1;
        if (query || activeFilter !== "all" || hideCheckedInput.checked) {
          card.classList.add("is-open");
          card
            .querySelector(".site-card__toggle")
            .setAttribute("aria-expanded", "true");
        }
      }
    });

    emptyState.hidden = visibleSiteCount !== 0;
  }

  function openPreview(page) {
    previewSite.textContent = page.siteName;
    previewTitle.textContent = page.pageName;
    previewPath.textContent = page.source;
    previewBadges.replaceChildren(...createBadges(page, true));
    previewOpen.href = page.preview;
    previewFrame.src = page.preview;
    dialog.showModal();
  }

  function closePreview() {
    if (dialog.open) dialog.close();
  }

  function createBadges(page, verbose = false) {
    const badges = [];
    if (page.direct) {
      badges.push(
        badge(
          "direct",
          verbose
            ? verboseCount(page.direct, "directVerbose")
            : `${page.direct} P`,
        ),
      );
    }
    if (page.clickable) {
      badges.push(
        badge(
          "clickable",
          verbose
            ? verboseCount(page.clickable, "clickableVerbose")
            : `${page.clickable} C`,
        ),
      );
    }
    if (page.decoy) {
      badges.push(
        badge(
          "decoy",
          verbose
            ? verboseCount(page.decoy, "decoyVerbose")
            : `${page.decoy} F`,
        ),
      );
    }
    return badges;
  }

  function badge(type, text) {
    const element = document.createElement("span");
    element.className = `marker-badge marker-badge--${type}`;
    element.textContent = text;
    return element;
  }

  function updateProgress() {
    const complete = checkedPages.size;
    const total = data.stats.pageCount;
    document.querySelector("#progress-label").textContent =
      `${complete} / ${total} ${t("reviewed")}`;
  }

  function pageCountLabel(count) {
    const unit = count === 1 ? t("pageSingular") : t("pagePlural");
    return `${count} ${unit}`;
  }

  function verboseCount(count, key) {
    const label = t(key);
    if (currentLanguage === "en" && count !== 1) return `${count} ${label}s`;
    return `${count} ${label}`;
  }

  function setupReveals() {
    const elements = document.querySelectorAll("[data-reveal]");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px" },
    );

    elements.forEach((element) => observer.observe(element));
  }

  function loadKeyState() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(KEY_STORAGE_KEY) ?? "null",
      );
      return KEY_CORE.sanitizeState(saved);
    } catch {
      return KEY_CORE.createEmptyState();
    }
  }

  function saveKeyState() {
    localStorage.setItem(KEY_STORAGE_KEY, JSON.stringify(keyState));
  }

  function loadProgress() {
    try {
      const knownPageIds = new Set(
        Object.values(DATA_BY_LANGUAGE).flatMap((entry) =>
          entry.pages.map((page) => page.id),
        ),
      );
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      return Array.isArray(value)
        ? value.filter((id) => knownPageIds.has(id))
        : [];
    } catch {
      return [];
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...checkedPages]));
  }

  function t(key) {
    return COPY[currentLanguage][key] ?? COPY.tr[key] ?? key;
  }

  function formatCopy(key, values) {
    return Object.entries(values).reduce(
      (copy, [name, value]) => copy.replaceAll(`{${name}}`, String(value)),
      t(key),
    );
  }

  function numberLocale() {
    return currentLanguage === "tr" ? "tr-TR" : "en-US";
  }

  function detectBrowserLanguage() {
    const languages = navigator.languages?.length
      ? navigator.languages
      : [navigator.language];
    return languages.some((language) =>
      String(language).toLocaleLowerCase("en-US").startsWith("tr"),
    )
      ? "tr"
      : "en";
  }

  function normalize(value) {
    return String(value)
      .toLocaleLowerCase(numberLocale())
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replaceAll("ı", "i");
  }
})();

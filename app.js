(() => {
  document.documentElement.classList.add("has-js");

  const DATA_BY_LANGUAGE = {
    tr: window.HASH_ATLAS_DATA,
    en: window.HASH_ATLAS_DATA_EN,
  };

  if (!DATA_BY_LANGUAGE.tr || !DATA_BY_LANGUAGE.en) {
    document.body.innerHTML =
      '<main style="padding:40px;font-family:sans-serif"><h1>Veri dosyaları bulunamadı</h1><p><code>tools/generate.mjs</code> dosyasını iki dil için çalıştır.</p></main>';
    return;
  }

  const COPY = {
    tr: {
      documentTitle: "WTTG III | Hash Bulma",
      description: "hash bulma",
      homeAria: "Başa dön",
      wordmark: "Hash Bulma",
      language: "Dil",
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
  const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
  let currentLanguage = savedLanguage === "en" ? "en" : "tr";
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

  applyTranslations();
  updateStats();
  renderSites();
  updateProgress();
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

  function numberLocale() {
    return currentLanguage === "tr" ? "tr-TR" : "en-US";
  }

  function normalize(value) {
    return String(value)
      .toLocaleLowerCase(numberLocale())
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replaceAll("ı", "i");
  }
})();

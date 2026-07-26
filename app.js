(() => {
  document.documentElement.classList.add("has-js");

  const data = window.HASH_ATLAS_DATA;
  if (!data) {
    document.body.innerHTML =
      '<main style="padding:40px;font-family:sans-serif"><h1>data.js bulunamadı</h1><p><code>tools/generate.mjs</code> dosyasını çalıştır.</p></main>';
    return;
  }

  const STORAGE_KEY = "wttg3-hash-atlas-progress-v1";
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
  let activeFilter = "all";

  document.querySelector("#site-count").textContent = data.stats.siteCount;
  document.querySelector("#page-count").textContent = data.stats.pageCount;
  document.querySelector("#marker-count").textContent =
    data.stats.uniqueMarkers.toLocaleString("tr-TR");

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
    if (!window.confirm("Bakıldı işaretlerinin tümü silinsin mi?")) return;
    checkedPages.clear();
    saveProgress();
    document.querySelectorAll(".page-check input").forEach((input) => {
      input.checked = false;
    });
    updateProgress();
    applyFilters();
  });

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
        `${site.pageCount} sayfa`;
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
        row.dataset.search = normalize(`${site.name} ${page.pageName} ${page.pageId}`);
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
          verbose ? `${page.direct} görünür konum` : `${page.direct} P`,
        ),
      );
    }
    if (page.clickable) {
      badges.push(
        badge(
          "clickable",
          verbose ? `${page.clickable} doğru tıklama` : `${page.clickable} C`,
        ),
      );
    }
    if (page.decoy) {
      badges.push(
        badge(
          "decoy",
          verbose ? `${page.decoy} sahte tıklama` : `${page.decoy} F`,
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
      `${complete} / ${total} bakıldı`;
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
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      return Array.isArray(value)
        ? value.filter((id) => data.pages.some((page) => page.id === id))
        : [];
    } catch {
      return [];
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...checkedPages]));
  }

  function normalize(value) {
    return String(value)
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replaceAll("ı", "i");
  }
})();

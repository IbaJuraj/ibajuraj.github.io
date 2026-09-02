(() => {
  const SUPPORTED = {
    sk: "Slovenčina",
    cs: "Čeština",
    en: "English",
    de: "Deutsch",
    pl: "Polski",
    hu: "Magyar"
  };
  const SK_META = {
    siteTitle: "IbaJuraj Apps",
    siteDescription: "Praktické aplikácie na každý deň – pre termíny, právnu orientáciu, výpočty a vernostné karty.",
    privacyTitle: "Ochrana súkromia – IbaJuraj Apps",
    privacyDescription: "Zásady ochrany súkromia aplikácií a webu IbaJuraj Apps.",
    ogLocale: "sk_SK",
    languageLabel: "Jazyk",
    formSubject: "Nová správa z webu IbaJuraj Apps",
    sending: "Odosielam…",
    success: "Správa bola úspešne odoslaná. Ďakujeme.",
    error: "Správu sa nepodarilo odoslať. Skúste to, prosím, znova."
  };
  const STOREFRONT = { sk: "sk", cs: "cz", en: "us", de: "de", pl: "pl", hu: "hu" };
  const APPLE_LANG = { sk: "sk", cs: "cs", en: "en", de: "de", pl: "pl", hu: "hu" };
  const STORAGE_KEY = "ibajuraj-language";

  const normalizeLanguage = (value) => {
    const raw = String(value || "").trim().toLowerCase().replace("_", "-");
    if (raw === "cz") return "cs";
    const short = raw.split("-")[0];
    return Object.prototype.hasOwnProperty.call(SUPPORTED, short) ? short : null;
  };

  const params = new URLSearchParams(window.location.search);
  const explicit = normalizeLanguage(params.get("lang"));
  const saved = normalizeLanguage(localStorage.getItem(STORAGE_KEY));
  const browser = normalizeLanguage(navigator.language);
  const currentLanguage = explicit || saved || browser || "sk";

  let locale = { meta: SK_META, strings: {} };

  const t = (source, fallback = source) => locale.strings?.[source] || fallback;
  const message = (key, fallback) => locale.meta?.[key] || fallback;

  window.IbaJurajI18n = {
    language: currentLanguage,
    t,
    message,
    supported: { ...SUPPORTED }
  };

  const loadLocale = async () => {
    if (currentLanguage === "sk") return;
    try {
      const response = await fetch(`/locales/${currentLanguage}.json?v=20260902`, { cache: "no-store" });
      if (!response.ok) throw new Error("Locale request failed");
      const loaded = await response.json();
      if (!loaded || typeof loaded !== "object" || typeof loaded.strings !== "object") {
        throw new Error("Invalid locale");
      }
      locale = loaded;
    } catch (_) {
      locale = { meta: SK_META, strings: {} };
    }
  };

  const preserveWhitespaceReplace = (node) => {
    const value = node.nodeValue;
    if (!value || !value.trim()) return;
    const trimmed = value.trim();
    const translated = locale.strings?.[trimmed];
    if (!translated || translated === trimmed) return;
    const leading = value.match(/^\s*/)?.[0] || "";
    const trailing = value.match(/\s*$/)?.[0] || "";
    node.nodeValue = `${leading}${translated}${trailing}`;
  };

  const shouldSkipNode = (node) => {
    const parent = node.parentElement;
    if (!parent) return true;
    return ["SCRIPT", "STYLE", "CODE", "PRE"].includes(parent.tagName);
  };

  const translateTextNodes = () => {
    if (currentLanguage === "sk") return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      if (!shouldSkipNode(walker.currentNode)) nodes.push(walker.currentNode);
    }
    nodes.forEach(preserveWhitespaceReplace);
  };

  const translateAttributes = () => {
    document.querySelectorAll("[placeholder], [aria-label], [title]").forEach((element) => {
      ["placeholder", "aria-label", "title"].forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;
        const value = element.getAttribute(attribute);
        const translated = locale.strings?.[String(value || "").trim()];
        if (translated) element.setAttribute(attribute, translated);
      });
    });
  };

  const updateMetadata = () => {
    const isPrivacy = /privacy\.html$/i.test(window.location.pathname);
    const info = locale.meta || SK_META;
    document.documentElement.lang = currentLanguage;
    document.title = isPrivacy ? info.privacyTitle : info.siteTitle;

    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = isPrivacy ? info.privacyDescription : info.siteDescription;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = isPrivacy ? info.privacyTitle : info.siteTitle;
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.content = isPrivacy ? info.privacyDescription : info.siteDescription;
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.content = info.ogLocale;
  };

  const updateAppStoreLinks = () => {
    const storefront = STOREFRONT[currentLanguage] || "sk";
    const language = APPLE_LANG[currentLanguage] || "sk";
    document.querySelectorAll('a[href*="apps.apple.com/"]').forEach((link) => {
      try {
        const url = new URL(link.href);
        const segments = url.pathname.split("/");
        if (segments.length > 1) segments[1] = storefront;
        url.pathname = segments.join("/");
        if (url.searchParams.has("l")) url.searchParams.set("l", language);
        link.href = url.toString();
      } catch (_) {}
    });
  };

  const addLanguageStylesheet = () => {
    if (document.querySelector('link[data-ibajuraj-i18n-style]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/i18n.css?v=20260902";
    link.dataset.ibajurajI18nStyle = "true";
    document.head.appendChild(link);
  };

  const addLanguageSwitcher = () => {
    const navigation = document.getElementById("mobile-navigation");
    if (!navigation || document.getElementById("site-language")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "language-switcher";

    const label = document.createElement("label");
    label.htmlFor = "site-language";
    label.className = "visually-hidden";
    label.textContent = locale.meta?.languageLabel || "Jazyk";

    const select = document.createElement("select");
    select.id = "site-language";
    select.className = "language-select";
    select.setAttribute("aria-label", locale.meta?.languageLabel || "Jazyk");

    Object.entries(SUPPORTED).forEach(([code, name]) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = name;
      option.selected = code === currentLanguage;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      const next = normalizeLanguage(select.value) || "sk";
      localStorage.setItem(STORAGE_KEY, next);
      const url = new URL(window.location.href);
      if (next === "sk") url.searchParams.delete("lang");
      else url.searchParams.set("lang", next);
      window.location.assign(url.toString());
    });

    wrapper.append(label, select);
    navigation.appendChild(wrapper);
  };

  const updateLocalizedInternalLinks = () => {
    if (currentLanguage === "sk") return;
    document.querySelectorAll('a[href^="index.html"], a[href^="privacy.html"]').forEach((link) => {
      const raw = link.getAttribute("href");
      if (!raw) return;
      try {
        const url = new URL(raw, window.location.href);
        url.searchParams.set("lang", currentLanguage);
        link.href = url.toString();
      } catch (_) {}
    });
  };

  const setCanonicalAlternates = () => {
    const basePath = /privacy\.html$/i.test(window.location.pathname) ? "/privacy.html" : "/";
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => node.remove());
    Object.keys(SUPPORTED).forEach((code) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = code;
      link.href = code === "sk"
        ? `https://ibajuraj.github.io${basePath}`
        : `https://ibajuraj.github.io${basePath}?lang=${code}`;
      document.head.appendChild(link);
    });
    const xDefault = document.createElement("link");
    xDefault.rel = "alternate";
    xDefault.hreflang = "x-default";
    xDefault.href = `https://ibajuraj.github.io${basePath}`;
    document.head.appendChild(xDefault);
  };

  const apply = async () => {
    await loadLocale();
    window.IbaJurajI18n.language = currentLanguage;
    window.IbaJurajI18n.t = t;
    window.IbaJurajI18n.message = message;

    addLanguageStylesheet();
    updateMetadata();
    translateTextNodes();
    translateAttributes();
    updateAppStoreLinks();
    updateLocalizedInternalLinks();
    addLanguageSwitcher();
    setCanonicalAlternates();
    localStorage.setItem(STORAGE_KEY, currentLanguage);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply, { once: true });
  } else {
    apply();
  }
})();

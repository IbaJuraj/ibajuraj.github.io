document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const submit = form?.querySelector('button[type="submit"]');
  const label = submit?.querySelector(".button-label");
  const appSelect = document.getElementById("app");
  const messageTypeSelect = document.getElementById("message-type");
  const subjectInput = document.getElementById("subject");
  const emailInput = document.getElementById("email");
  const subjectField = form?.querySelector('input[name="_subject"]');
  const backToTop = document.getElementById("back-to-top");
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.getElementById("mobile-navigation");
  const currentYear = document.getElementById("current-year");

  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  const closeMenu = () => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  const openMenu = () => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute("aria-expanded", "true");
    navigation.classList.add("is-open");
    document.body.classList.add("menu-open");
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!navigation?.classList.contains("is-open")) return;
    if (navigation.contains(event.target) || menuToggle?.contains(event.target)) return;
    closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });

  document.querySelectorAll("[data-app]").forEach((link) => {
    link.addEventListener("click", () => {
      const app = link.getAttribute("data-app");
      if (appSelect && app) {
        appSelect.value = app;
        updateMessageSubject();
        window.setTimeout(() => appSelect.focus({ preventScroll: true }), 350);
      }
    });
  });

  const selectKnownValue = (select, requestedValue, aliases = {}) => {
    if (!select || !requestedValue) return false;
    const normalized = requestedValue.trim().toLocaleLowerCase("sk");
    const aliasValue = aliases[normalized];
    const matchingOption = Array.from(select.options).find((option) =>
      option.value.toLocaleLowerCase("sk") === normalized
    );
    const value = aliasValue || matchingOption?.value;
    if (!value) return false;
    select.value = value;
    return true;
  };

  const appAliases = {
    "strazca-terminov": "Strážca Termínov",
    "strazcaterminov": "Strážca Termínov",
    "lex-drive": "Lex Drive",
    "lexdrive": "Lex Drive",
    "jurajcalc": "Kalkulačka 2v1",
    "kalkulacka-2v1": "Kalkulačka 2v1",
    "kalkulacka": "Kalkulačka 2v1",
    "penazenka-kariet": "Peňaženka Kariet",
    "penazenkakariet": "Peňaženka Kariet",
    "general": "Všeobecná otázka"
  };
  const typeAliases = {
    "question": "Otázka k používaniu",
    "usage": "Otázka k používaniu",
    "technical": "Technický problém",
    "bug": "Technický problém",
    "content": "Nesprávny údaj alebo obsah",
    "suggestion": "Návrh na zlepšenie",
    "privacy": "Ochrana súkromia",
    "other": "Iné"
  };

  const updateMessageSubject = () => {
    if (!subjectField) return;
    const parts = ["Nová správa z webu IbaJuraj Apps"];
    if (appSelect?.value) parts.push(appSelect.value);
    if (messageTypeSelect?.value) parts.push(messageTypeSelect.value);
    subjectField.value = parts.join(" – ");
  };

  if (form) {
    const parameters = new URLSearchParams(window.location.search);
    const appWasSet = selectKnownValue(appSelect, parameters.get("app"), appAliases);
    const typeWasSet = selectKnownValue(messageTypeSelect, parameters.get("type"), typeAliases);
    const requestedSubject = (parameters.get("subject") || "")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);

    if (subjectInput && requestedSubject) subjectInput.value = requestedSubject;
    if (appWasSet || typeWasSet || requestedSubject) {
      window.setTimeout(() => emailInput?.focus({ preventScroll: true }), 350);
    }

    appSelect?.addEventListener("change", updateMessageSubject);
    messageTypeSelect?.addEventListener("change", updateMessageSubject);
    updateMessageSubject();
  }

  if (form && submit && label && status) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      updateMessageSubject();
      status.textContent = "";
      status.className = "form-status";
      submit.disabled = true;
      label.textContent = "Odosielam…";

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        });

        if (!response.ok) throw new Error("Formspree request failed");

        form.reset();
        status.textContent = "Správa bola úspešne odoslaná. Ďakujeme.";
        status.classList.add("success");
      } catch (error) {
        status.textContent = "Správu sa nepodarilo odoslať. Skúste to, prosím, znova.";
        status.classList.add("error");
      } finally {
        submit.disabled = false;
        label.textContent = "Odoslať správu";
      }
    });
  }

  const updateBackToTop = () => {
    if (!backToTop) return;
    backToTop.classList.toggle("is-visible", window.scrollY > 650 && window.innerWidth > 760);
  };

  window.addEventListener("scroll", updateBackToTop, { passive: true });
  window.addEventListener("resize", updateBackToTop);
  updateBackToTop();

  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const loadStandardMetadata = async () => {
    const versionNodes = document.querySelectorAll("[data-standard-version]");
    const documentLinks = document.querySelectorAll("[data-standard-document]");
    if (!versionNodes.length && !documentLinks.length) return;

    const repository = "https://github.com/IbaJuraj/ibajuraj-application-standard";
    const metadataURL = "https://raw.githubusercontent.com/IbaJuraj/ibajuraj-application-standard/main/standard.json";

    try {
      const response = await fetch(`${metadataURL}?ts=${Date.now()}`, {
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("Standard metadata request failed");

      const metadata = await response.json();
      const metadataStatus = typeof metadata.status === "string" ? metadata.status.trim().toLowerCase() : "";
      if (metadataStatus !== "active") throw new Error("Standard metadata is not active");
      const version = typeof metadata.version === "string" ? metadata.version.trim() : "";
      if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
        throw new Error("Invalid standard version");
      }

      const safeTag = typeof metadata.source?.tag === "string" && /^standard-v\d+\.\d+\.\d+$/.test(metadata.source.tag)
        ? metadata.source.tag
        : `standard-v${version}`;
      const documentName = typeof metadata.source?.document === "string" && /^[A-Za-z0-9._-]+$/.test(metadata.source.document)
        ? metadata.source.document
        : "IBAJURAJ_APPLICATION_STANDARD.md";
      const documentURL = `${repository}/blob/${encodeURIComponent(safeTag)}/${encodeURIComponent(documentName)}`;

      versionNodes.forEach((node) => {
        node.textContent = version;
        node.setAttribute("title", "Aktuálna verzia načítaná z autoritatívneho GitHub repozitára");
      });
      documentLinks.forEach((link) => link.setAttribute("href", documentURL));
    } catch (error) {
      versionNodes.forEach((node) => node.setAttribute("title", "Zobrazená je posledná známa verzia; aktuálnosť overte v repozitári"));
    }
  };

  loadStandardMetadata();
});

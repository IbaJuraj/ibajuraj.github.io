(() => {
  const loadI18n = () => {
    if (document.querySelector('script[data-ibajuraj-i18n]')) return;
    const script = document.createElement("script");
    script.src = "/i18n.js?v=20260902";
    script.defer = true;
    script.dataset.ibajurajI18n = "true";
    document.head.appendChild(script);
  };

  loadI18n();

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

    const i18nMessage = (key, fallback) => window.IbaJurajI18n?.message?.(key, fallback) || fallback;
    const i18nText = (source, fallback = source) => window.IbaJurajI18n?.t?.(source, fallback) || fallback;

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
      const parts = [i18nMessage("formSubject", "Nová správa z webu IbaJuraj Apps")];
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
        label.textContent = i18nMessage("sending", "Odosielam…");

        try {
          const response = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { Accept: "application/json" }
          });

          if (!response.ok) throw new Error("Formspree request failed");

          form.reset();
          status.textContent = i18nMessage("success", "Správa bola úspešne odoslaná. Ďakujeme.");
          status.classList.add("success");
        } catch (error) {
          status.textContent = i18nMessage("error", "Správu sa nepodarilo odoslať. Skúste to, prosím, znova.");
          status.classList.add("error");
        } finally {
          submit.disabled = false;
          label.textContent = i18nText("Odoslať správu", "Odoslať správu");
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
      // Use active main/standard.json as the single source. Never show a stale fallback version.
      const fallbackDocumentURL = `${repository}/blob/main/IBAJURAJ_APPLICATION_STANDARD.md`;

      versionNodes.forEach((node) => { node.textContent = "…"; node.removeAttribute("title"); });
      documentLinks.forEach((link) => link.setAttribute("href", fallbackDocumentURL));

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
        if (!/^\d+\.\d+\.\d+$/.test(version)) {
          throw new Error("Invalid standard version");
        }

        const declaredTag = metadata.source?.stableReleaseTag || metadata.source?.releaseTag || metadata.source?.tag;
        const safeTag = typeof declaredTag === "string" && declaredTag === `standard-v${version}`
          ? declaredTag
          : `standard-v${version}`;
        const documentName = typeof metadata.source?.document === "string" && /^[A-Za-z0-9._-]+$/.test(metadata.source.document)
          ? metadata.source.document
          : "IBAJURAJ_APPLICATION_STANDARD.md";
        const documentURL = `${repository}/blob/${encodeURIComponent(safeTag)}/${encodeURIComponent(documentName)}`;

        versionNodes.forEach((node) => {
          node.textContent = version;
          node.setAttribute("title", i18nText(
            "Aktuálna verzia načítaná z autoritatívneho GitHub repozitára",
            "Aktuálna verzia načítaná z autoritatívneho GitHub repozitára"
          ));
        });
        documentLinks.forEach((link) => link.setAttribute("href", documentURL));
      } catch (error) {
        versionNodes.forEach((node) => {
          node.textContent = "—";
          node.setAttribute("title", i18nText(
            "Verziu sa nepodarilo overiť; aktuálnosť overte v repozitári",
            "Verziu sa nepodarilo overiť; aktuálnosť overte v repozitári"
          ));
        });
      }
    };

    loadStandardMetadata();

    // Show ONLY locally hosted screenshots originating from the 4 official App Store IDs.
    // A missing/invalid verified manifest gracefully leaves the app cards text-only.
    const loadOfficialScreenshots = async () => {
      try {
        const response = await fetch("/assets/screenshots/manifest.json", {cache:"no-store"});
        if(!response.ok) return;
        const manifest=await response.json();
        const allowed={"strazca-terminov":6779741336,"lexdrive":6794546464,"jurajcalc":6777232702,"penazenka-kariet":6779166726};
        if(manifest?.schemaVersion!==1 || manifest?.publisher!=="Juraj Spevar") return;
        document.querySelectorAll("[data-gallery]").forEach(node=>{
          const slug=node.getAttribute("data-gallery"),entry=manifest.apps?.[slug];
          if(!entry || allowed[slug]!==entry.appStoreId || !Array.isArray(entry.screenshots)) return;
          const store=node.closest(".app-card")?.querySelector('.app-actions a[href*="apps.apple.com"]');
          if(!store) return;
          for(const file of entry.screenshots.slice(0,2)){
            if(typeof file!=="string" || !/^assets\/screenshots\/[a-z0-9-]+-[12]\.webp$/.test(file)) continue;
            const a=document.createElement("a");a.href=store.href;a.target="_blank";a.rel="noopener noreferrer";
            a.setAttribute("aria-label",node.getAttribute("aria-label"));
            const img=document.createElement("img");img.src="/"+file;img.alt="";img.loading="lazy";img.decoding="async";img.width=250;img.height=544;
            a.appendChild(img);node.appendChild(a);
          }
          if(node.children.length) node.hidden=false;
        });
      }catch(_){/* No unverifiable substitutes */ }
    };
    loadOfficialScreenshots();

  });
})();

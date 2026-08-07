document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const submit = form?.querySelector('button[type="submit"]');
  const label = submit?.querySelector(".button-label");
  const appSelect = document.getElementById("app");
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
        window.setTimeout(() => appSelect.focus({ preventScroll: true }), 350);
      }
    });
  });

  if (form && submit && label && status) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
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
      const version = typeof metadata.version === "string" ? metadata.version.trim() : "";
      if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
        throw new Error("Invalid standard version");
      }

      const tag = metadata.source?.tag || `standard-v${version}`;
      const documentName = metadata.source?.document || "IBAJURAJ_APPLICATION_STANDARD.md";
      const documentURL = `${repository}/blob/${encodeURIComponent(tag)}/${encodeURIComponent(documentName)}`;

      versionNodes.forEach((node) => {
        node.textContent = version;
        node.setAttribute("title", "Aktuálna verzia načítaná z autoritatívneho GitHub repozitára");
      });
      documentLinks.forEach((link) => link.setAttribute("href", documentURL));
    } catch (error) {
      versionNodes.forEach((node) => {
        node.textContent = "aktuálna verzia";
        node.setAttribute("title", "Verziu sa nepodarilo načítať; použite autoritatívny GitHub repozitár");
      });
      documentLinks.forEach((link) => link.setAttribute("href", repository));
    }
  };

  loadStandardMetadata();
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const supportSection = document.getElementById("support");
  const status = document.getElementById("form-status");
  const submit = form?.querySelector('button[type="submit"]');
  const label = submit?.querySelector(".button-label");
  const appSelect = document.getElementById("app");
  const typeSelect = document.getElementById("message-type");
  const message = document.getElementById("message");
  const subjectInput = form?.querySelector('input[name="_subject"]');
  const backToTop = document.getElementById("back-to-top");

  const selectExistingOption = (select, value) => {
    if (!select || !value) return false;
    const exists = Array.from(select.options).some((option) => option.value === value);
    if (!exists) return false;
    select.value = value;
    return true;
  };

  const params = new URLSearchParams(window.location.search);
  const requestedApp = params.get("app");
  const requestedType = params.get("type");
  const requestedSubject = params.get("subject");

  const appWasPrefilled = selectExistingOption(appSelect, requestedApp);
  const typeWasPrefilled = selectExistingOption(typeSelect, requestedType);

  if (requestedSubject && message && !message.value.trim()) {
    message.value = `Téma: ${requestedSubject}\n\n`;
  }

  if (subjectInput && (requestedApp || requestedType || requestedSubject)) {
    const subjectParts = [requestedApp, requestedSubject || requestedType].filter(Boolean);
    subjectInput.value = subjectParts.length
      ? subjectParts.join(" – ")
      : "Nová správa z webu IbaJuraj Apps";
  }

  const cameFromSupportLink = ["#support", "#kontakt"].includes(window.location.hash)
    || appWasPrefilled
    || typeWasPrefilled
    || Boolean(requestedSubject);

  if (cameFromSupportLink && supportSection) {
    window.requestAnimationFrame(() => {
      supportSection.scrollIntoView({ behavior: "auto", block: "start" });
    });

    if (status && (appWasPrefilled || typeWasPrefilled || requestedSubject)) {
      status.textContent = "Údaje z aplikácie boli predvyplnené. Skontrolujte ich a doplňte správu.";
    }
  }

  document.querySelectorAll("[data-app]").forEach((link) => {
    link.addEventListener("click", () => {
      const app = link.getAttribute("data-app");
      selectExistingOption(appSelect, app);
    });
  });

  if (form) {
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

        if (!response.ok) {
          throw new Error("Formspree request failed");
        }

        form.reset();
        status.textContent = "Správa bola úspešne odoslaná. Ďakujeme.";
        status.classList.add("success");
      } catch (error) {
        status.textContent = "Správu sa nepodarilo odoslať. Skúste to znova alebo použite Telegram.";
        status.classList.add("error");
      } finally {
        submit.disabled = false;
        label.textContent = "Odoslať správu";
      }
    });
  }

  const updateBackToTop = () => {
    backToTop?.classList.toggle("visible", window.scrollY > 700);
  };

  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

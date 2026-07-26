document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const submit = form?.querySelector('button[type="submit"]');
  const label = submit?.querySelector(".button-label");
  const appSelect = document.getElementById("app");
  const backToTop = document.getElementById("back-to-top");

  document.querySelectorAll("[data-app]").forEach((link) => {
    link.addEventListener("click", () => {
      const app = link.getAttribute("data-app");
      if (appSelect && app) {
        appSelect.value = app;
      }
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

(() => {
  const form = document.getElementById("kc-form-login");
  const password = document.getElementById("password");
  const capsLockWarning = document.getElementById("linercore-caps-lock");
  const passwordToggle = document.querySelector("[data-password-toggle]");

  if (passwordToggle) {
    passwordToggle.addEventListener("click", () => {
      requestAnimationFrame(() => {
        passwordToggle.title = passwordToggle.getAttribute("aria-label") ?? "";
      });
    });
  }

  if (password && capsLockWarning) {
    const updateCapsLock = (event) => {
      const capsLockOn = event.getModifierState?.("CapsLock") ?? false;
      capsLockWarning.hidden = !capsLockOn;
    };

    password.addEventListener("keydown", updateCapsLock);
    password.addEventListener("keyup", updateCapsLock);
    password.addEventListener("blur", () => {
      capsLockWarning.hidden = true;
    });
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      if (form.dataset.submitting === "true") {
        event.preventDefault();
        return;
      }

      form.dataset.submitting = "true";
      form.setAttribute("aria-busy", "true");

      const submitButton = document.getElementById("kc-login");
      const submitLabel = submitButton?.querySelector(".linercore-button-label");
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = true;
      }
      if (submitLabel && submitButton?.dataset.submittingLabel) {
        submitLabel.textContent = submitButton.dataset.submittingLabel;
      }
    });
  }
})();

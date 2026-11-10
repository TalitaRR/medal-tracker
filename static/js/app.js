document.addEventListener("DOMContentLoaded", () => {
  const alerts = document.getElementById("app-alerts");

  window.showMessage = (message, type = "success") => {
    if (!alerts) return;
    alerts.innerHTML = "";
    const element = document.createElement("div");
    element.className = `alert ${type === "success" ? "alert-success" : "alert-danger"} alert-dismissible fade show`;
    element.setAttribute("role", "alert");
    element.textContent = message;
    const close = document.createElement("button");
    close.type = "button";
    close.className = "btn-close";
    close.setAttribute("aria-label", "Close");
    close.addEventListener("click", () => element.remove());
    element.appendChild(close);
    alerts.appendChild(element);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
});

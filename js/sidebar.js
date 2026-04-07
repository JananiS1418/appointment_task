(function () {
  const STORAGE_KEY = "capminds_sidebar_collapsed";

  const workspace = document.querySelector(".workspace");
  const toggle = document.querySelector(".sidebar-toggle");

  if (!workspace || !toggle) {
    return;
  }

  const storedState = localStorage.getItem(STORAGE_KEY) === "true";
  setCollapsed(storedState);

  toggle.addEventListener("click", () => {
    const collapsed = !workspace.classList.contains("sidebar-collapsed");
    setCollapsed(collapsed);
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  });

  function setCollapsed(collapsed) {
    workspace.classList.toggle("sidebar-collapsed", collapsed);
    toggle.innerHTML = collapsed ? "&raquo;" : "&laquo;";
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
  }
})();

(function () {
  "use strict";

  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function isDark() {
    var t = root.dataset.theme;
    return t ? t === "dark" : media.matches;
  }

  function syncToggle() {
    if (toggle) toggle.setAttribute("aria-pressed", String(isDark()));
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncToggle();
    });
  }
  media.addEventListener("change", syncToggle);
  syncToggle();

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Highlight the nav link for the section currently in view
  var links = document.querySelectorAll(".site-nav a");
  if ("IntersectionObserver" in window && links.length) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (a) { a.removeAttribute("aria-current"); });
          byId[entry.target.id].setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) {
      if (byId[s.id]) observer.observe(s);
    });
  }
})();

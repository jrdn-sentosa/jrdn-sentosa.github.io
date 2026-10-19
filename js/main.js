(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Small seeded PRNG so the skyline looks the same on every load
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rand = mulberry32(2026);

  function el(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  // Slow, staggered twinkle (negative delay = starts mid-cycle)
  function twinkle(n) {
    n.setAttribute("class", "tw");
    n.style.setProperty("--d", (4 + rand() * 5).toFixed(1) + "s");
    n.style.setProperty("--dl", "-" + (rand() * 9).toFixed(1) + "s");
  }

  // ---- Windows ----
  // Every .wz rect is a window zone inside one building. Windows sit on a centred grid
  // inside the zone and are clipped to the building named in data-clip, so none can
  // spill outside its own silhouette.
  var svg = document.querySelector(".skyline");
  var defs = svg && svg.querySelector("defs");
  var clips = {};
  function clipFor(sel) {
    if (clips[sel]) return clips[sel];
    var id = "clip-" + sel.slice(1);
    var cp = el("clipPath", { id: id });
    cp.appendChild(el("use", { href: sel }));
    defs.appendChild(cp);
    return (clips[sel] = "url(#" + id + ")");
  }

  var colors = ["#F6C35B", "#F6C35B", "#F6C35B", "#FFE9B0", "#2DE2E6"];
  document.querySelectorAll("#city .wz").forEach(function (z) {
    var x = +z.getAttribute("x"), y = +z.getAttribute("y");
    var w = +z.getAttribute("width"), h = +z.getAttribute("height");
    var density = +z.getAttribute("data-d") || 0.4;
    var dim = z.hasAttribute("data-dim");
    var cols = Math.floor((w + 5) / 8), rows = Math.floor((h + 6.5) / 11);
    if (cols < 1 || rows < 1) return;
    var ox = x + (w - (cols * 8 - 5)) / 2, oy = y + (h - (rows * 11 - 6.5)) / 2;
    var g = el("g", {});
    var target = z.getAttribute("data-clip");
    if (target) g.setAttribute("clip-path", clipFor(target));
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (rand() > density) continue;
        var win = el("rect", {
          x: (ox + c * 8).toFixed(1), y: (oy + r * 11).toFixed(1), width: 3, height: 4.5,
          fill: dim ? "#F6C35B" : colors[Math.floor(rand() * colors.length)]
        });
        if (dim) win.setAttribute("opacity", z.getAttribute("data-o") || "0.3");
        else if (rand() < 0.3) twinkle(win);
        else win.setAttribute("opacity", "0.85");
        g.appendChild(win);
      }
    }
    z.parentNode.insertBefore(g, z.nextSibling);
  });

  // ---- Stars ----
  var stars = document.getElementById("stars");
  if (stars) {
    for (var i = 0; i < 45; i++) {
      var s = el("circle", {
        cx: (rand() * 1200).toFixed(0), cy: (rand() * 230).toFixed(0),
        r: (0.5 + rand() * 0.7).toFixed(2), fill: "#E8ECF8",
        opacity: (0.4 + rand() * 0.5).toFixed(2)
      });
      if (rand() < 0.4) twinkle(s);
      stars.appendChild(s);
    }
  }

  // ---- Footer year ----
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // ---- Fade sections in on scroll ----
  if ("IntersectionObserver" in window && !reduceMotion) {
    var items = document.querySelectorAll("main section > h2, main .entry");
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          reveal.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (n) {
      n.classList.add("reveal");
      var sib = Array.prototype.indexOf.call(n.parentNode.children, n);
      n.style.setProperty("--i", (Math.min(sib, 4) * 0.12).toFixed(2) + "s");
      reveal.observe(n);
    });
  }

  // ---- Highlight the nav link for the section in view ----
  var links = document.querySelectorAll(".site-nav a");
  if ("IntersectionObserver" in window && links.length) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.removeAttribute("aria-current"); });
          byId[e.target.id].setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) {
      if (byId[s.id]) spy.observe(s);
    });
  }
})();

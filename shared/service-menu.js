/**
 * Service Menu — preview-only floating navigator.
 *
 * Generic across projects. Configure per-project by setting either of these
 * BEFORE this script loads (or via a small inline <script> on each page):
 *
 *   <script>
 *     window.PREVIEW_PROJECT_NAME = "My Project";    // shown in panel header
 *     window.PREVIEW_VERSIONS = [
 *       { id: "launcher",  label: "Launcher",  desc: "Index of all versions",         path: "" },
 *       { id: "concept-1", label: "Concept 1", desc: "Short description for the pill", path: "concept-1/" },
 *       // ...
 *     ];
 *     window.PREVIEW_DEFAULT_VERSION = "concept-1";  // surfaced on launcher page
 *   </script>
 *   <link  rel="stylesheet" href="../shared/service-menu.css">
 *   <script defer src="../shared/service-menu.js"></script>
 *
 * Falls back to a single "Launcher" version if nothing is configured.
 */

(function () {
  "use strict";

  if (window.__previewServiceMenuInited) return;
  window.__previewServiceMenuInited = true;

  /* ── Config (read from window globals, with sensible defaults) ── */

  var PROJECT_NAME = window.PREVIEW_PROJECT_NAME || "Project Preview";

  var VERSIONS = (Array.isArray(window.PREVIEW_VERSIONS) && window.PREVIEW_VERSIONS.length)
    ? window.PREVIEW_VERSIONS
    : [{ id: "launcher", label: "Launcher", desc: "Index of all preview versions", path: "" }];

  var DEFAULT_VERSION_ID = window.PREVIEW_DEFAULT_VERSION || VERSIONS[0].id;

  /* ── Base-URL detection (project root, relative to this script) ── */

  function detectBase() {
    var scripts = document.querySelectorAll('script[src*="service-menu"]');
    if (!scripts.length) return "/";
    var src = scripts[scripts.length - 1].getAttribute("src");
    var url = new URL(src, window.location.href);
    var idx = url.pathname.lastIndexOf("/shared/");
    return idx >= 0 ? url.pathname.substring(0, idx + 1) : "/";
  }

  function detectActive(base) {
    var path = window.location.pathname;
    for (var i = 0; i < VERSIONS.length; i++) {
      var v = VERSIONS[i];
      if (!v.path) continue;
      if (
        path.indexOf(base + v.path) === 0 ||
        path.endsWith("/" + v.path) ||
        path.endsWith("/" + v.path + "index.html")
      ) {
        return v.id;
      }
    }
    return DEFAULT_VERSION_ID;
  }

  /* ── Inline SVGs ── */

  function svgLayers() {
    return (
      '<svg class="service-menu__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M12 3 2 8l10 5 10-5-10-5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="m2 16 10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>"
    );
  }

  function svgCaret() {
    return (
      '<svg class="service-menu__caret" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>"
    );
  }

  /* ── Build & mount: version chip ── */

  function build() {
    var base = detectBase();
    var activeId = detectActive(base);
    var activeVersion = VERSIONS.find(function (v) { return v.id === activeId; }) || VERSIONS[0];

    var root = document.createElement("div");
    root.className = "service-menu";
    root.setAttribute("data-open", "false");

    var capsule = document.createElement("button");
    capsule.type = "button";
    capsule.className = "service-menu__capsule";
    capsule.setAttribute("aria-expanded", "false");
    capsule.setAttribute("aria-haspopup", "menu");
    capsule.setAttribute("aria-label", "Switch preview version");
    capsule.innerHTML =
      svgLayers() +
      '<span class="service-menu__label">' +
      escapeHtml(activeVersion.label) +
      "</span>" +
      svgCaret();

    var panel = document.createElement("div");
    panel.className = "service-menu__panel";
    panel.setAttribute("role", "menu");

    var header = document.createElement("div");
    header.className = "service-menu__panel-header";
    header.textContent = PROJECT_NAME + " — Preview";
    panel.appendChild(header);

    var list = document.createElement("ul");
    list.className = "service-menu__list";
    VERSIONS.forEach(function (v) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "service-menu__item";
      a.href = base + v.path;
      a.setAttribute("role", "menuitem");
      if (v.id === activeId) a.setAttribute("data-active", "true");
      a.innerHTML =
        '<div class="service-menu__item-title">' + escapeHtml(v.label) + "</div>" +
        '<div class="service-menu__item-desc">' + escapeHtml(v.desc) + "</div>";
      li.appendChild(a);
      list.appendChild(li);
    });
    panel.appendChild(list);

    var footer = document.createElement("div");
    footer.className = "service-menu__footer";
    footer.textContent = "Internal preview · not for distribution";
    panel.appendChild(footer);

    root.appendChild(capsule);
    root.appendChild(panel);
    document.body.appendChild(root);

    function setOpen(open) {
      root.setAttribute("data-open", open ? "true" : "false");
      capsule.setAttribute("aria-expanded", open ? "true" : "false");
    }
    capsule.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(root.getAttribute("data-open") !== "true");
    });
    document.addEventListener("click", function (e) {
      if (!root.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function init() { build(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

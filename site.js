/* Redirect website: the one shared script. Every page loads it in <head>.
   The site works without it; it only fills in the Google Play button, the waitlist fallback,
   the theme override and the hero's breathing timer. It sets no cookies and stores nothing. */

// ============================ SITE SETTINGS (the only values to edit) ============================
const SITE_CONFIG = {
  // Google Play listing, e.g. "https://play.google.com/store/apps/details?id=com.redirect.app".
  // Empty: every Play button reads "Coming soon to Google Play" and leads to the waitlist section.
  PLAY_STORE_URL: "",
  // true while that listing is in pre-registration ("Pre-register on Google Play").
  // false once the app is live ("Get it on Google Play"). Ignored while PLAY_STORE_URL is empty.
  PLAY_PREREGISTRATION: true,
  // The site's address, with no trailing slash. The <head> of every page, sitemap.xml, robots.txt and
  // the CNAME file (for GitHub Pages) carry it too: change them all together (see PUBLISH.md).
  SITE_URL: "https://redirect.hikmasolutions.co.za",
  // Before launch only: an address people can email to be told at launch, and an X profile.
  // Leave empty to hide the matching button.
  WAITLIST_EMAIL: "",
  X_PROFILE_URL: "",
};
// =================================================================================================

(function () {
  "use strict";
  var root = document.documentElement;

  // ?theme=dark or ?theme=light forces a theme (used for screenshots and checks). Not remembered.
  try {
    var theme = new URLSearchParams(location.search).get("theme");
    if (theme === "dark" || theme === "light") root.setAttribute("data-theme", theme);
  } catch (e) { /* old browser: follow the system theme */ }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function each(selector, fn) { Array.prototype.forEach.call(document.querySelectorAll(selector), fn); }

  function setUpPlay() {
    var url = SITE_CONFIG.PLAY_STORE_URL;
    var state = !url ? "soon" : (SITE_CONFIG.PLAY_PREREGISTRATION ? "preregister" : "live");
    var labels = {
      soon: "Coming soon to Google Play",
      preregister: "Pre-register on Google Play",
      live: "Get it on Google Play",
    };
    root.setAttribute("data-play", state);
    each("[data-play-label]", function (el) { el.textContent = labels[state]; });
    if (url) {
      each("[data-play-link]", function (a) { a.href = url; a.rel = "noopener"; });
    }
    each("[data-play-state]", function (el) {
      el.hidden = el.getAttribute("data-play-state").split(" ").indexOf(state) === -1;
    });
    if (state === "soon") {
      if (SITE_CONFIG.WAITLIST_EMAIL) {
        var subject = encodeURIComponent("Tell me when Redirect is out");
        each("[data-waitlist-link]", function (a) {
          a.href = "mailto:" + SITE_CONFIG.WAITLIST_EMAIL + "?subject=" + subject;
          a.hidden = false;
        });
        each("[data-waitlist-note]", function (el) { el.hidden = false; });
      }
      if (SITE_CONFIG.X_PROFILE_URL) {
        each("[data-x-link]", function (a) { a.href = SITE_CONFIG.X_PROFILE_URL; a.rel = "noopener"; a.hidden = false; });
      }
    }
  }

  // The canonical and og:url tags are written for crawlers in each page's <head>; keep them in step
  // with SITE_URL in case only this file was updated.
  function syncUrls() {
    var base = SITE_CONFIG.SITE_URL.replace(/\/$/, "");
    if (base === "https://redirect.hikmasolutions.co.za") return;
    each('link[rel="canonical"], meta[property="og:url"], meta[property="og:image"], meta[name="twitter:image"]', function (el) {
      var attr = el.tagName === "LINK" ? "href" : "content";
      el.setAttribute(attr, el.getAttribute(attr).replace("https://redirect.hikmasolutions.co.za", base));
    });
  }

  // The hero's Breathe screen: a 90-second countdown that matches the ring.
  function startTimer() {
    var el = document.querySelector("[data-breath-timer]");
    if (!el || reduceMotion) return;
    var start = Date.now();
    function tick() {
      var left = 90 - Math.floor(((Date.now() - start) / 1000) % 90);
      el.textContent = Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0");
    }
    tick();
    setInterval(tick, 1000);
  }

  // Close the small-screen menu after a choice (useful for in-page links).
  function setUpMenu() {
    each(".menu", function (menu) {
      menu.addEventListener("click", function (e) { if (e.target.closest("a")) menu.removeAttribute("open"); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") each(".menu[open]", function (m) { m.removeAttribute("open"); m.querySelector("summary").focus(); });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setUpPlay();
    syncUrls();
    startTimer();
    setUpMenu();
  });
})();

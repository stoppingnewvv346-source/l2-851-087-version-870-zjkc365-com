(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupGlobalSearch() {
    selectAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (value) {
          window.location.href = "./rankings.html?q=" + encodeURIComponent(value);
        }
      });
    });
  }

  function setupCardSearch() {
    var input = document.querySelector("[data-card-search]");
    var container = document.querySelector("[data-card-container]");
    if (!input || !container) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (query) {
      input.value = query;
    }
    var cards = selectAll("[data-movie-card]", container);
    function applyFilter() {
      var value = normalize(input.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));
        card.classList.toggle("is-hidden", value && haystack.indexOf(value) === -1);
      });
    }
    input.addEventListener("input", applyFilter);
    applyFilter();
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });
    start();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupGlobalSearch();
    setupCardSearch();
    setupHero();
  });
})();

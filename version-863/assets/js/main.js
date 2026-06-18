(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value == null ? "" : value).toLowerCase();
  }

  var navToggle = $("[data-nav-toggle]");
  var mobileNav = $("[data-mobile-nav]");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = $("[data-hero]");

  if (hero) {
    var slides = $all("[data-hero-slide]", hero);
    var dots = $all("[data-hero-dot]", hero);
    var prev = $("[data-hero-prev]", hero);
    var next = $("[data-hero-next]", hero);
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }

    function schedule() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        activate(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        activate(index + 1);
        schedule();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
        schedule();
      });
    });

    schedule();
  }

  function createSearchItem(movie) {
    var link = document.createElement("a");
    var strong = document.createElement("strong");
    var span = document.createElement("span");

    link.className = "search-result-item";
    link.href = movie.url;
    strong.textContent = movie.title;
    span.textContent = [movie.year, movie.region, movie.type, movie.genre].filter(Boolean).join(" · ");
    link.appendChild(strong);
    link.appendChild(span);
    return link;
  }

  function bindSearch(input) {
    var root = input.closest(".hero-search") || input.closest(".wide-search") || document;
    var results = $("[data-search-results]", root);
    var data = window.MOVIE_SEARCH_INDEX || [];

    if (!results) {
      return;
    }

    input.addEventListener("input", function () {
      var query = text(input.value).trim();
      results.innerHTML = "";

      if (!query) {
        results.classList.remove("is-open");
        return;
      }

      var matches = data.filter(function (movie) {
        return text(movie.title + " " + movie.year + " " + movie.region + " " + movie.type + " " + movie.genre + " " + movie.tags).indexOf(query) !== -1;
      }).slice(0, 12);

      matches.forEach(function (movie) {
        results.appendChild(createSearchItem(movie));
      });

      results.classList.toggle("is-open", matches.length > 0);
    });

    document.addEventListener("click", function (event) {
      if (!root.contains(event.target)) {
        results.classList.remove("is-open");
      }
    });
  }

  $all("[data-search-input]").forEach(bindSearch);

  var filterPanel = $("[data-filter-panel]");
  var localSearch = $("[data-local-search]");
  var cardList = $("[data-card-list]");
  var emptyState = $("[data-empty-state]");

  if (filterPanel && cardList) {
    var filters = {
      type: "all",
      region: "all",
      year: "all"
    };

    function applyFilters() {
      var query = localSearch ? text(localSearch.value).trim() : "";
      var visible = 0;

      $all("[data-movie-card]", cardList).forEach(function (card) {
        var match = true;
        Object.keys(filters).forEach(function (field) {
          if (filters[field] !== "all" && card.getAttribute("data-" + field) !== filters[field]) {
            match = false;
          }
        });

        if (query) {
          var haystack = text([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          if (haystack.indexOf(query) === -1) {
            match = false;
          }
        }

        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    $all("[data-filter-field]", filterPanel).forEach(function (button) {
      button.addEventListener("click", function () {
        var field = button.getAttribute("data-filter-field");
        var value = button.getAttribute("data-filter-value");
        filters[field] = value;
        $all("[data-filter-field='" + field + "']", filterPanel).forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilters();
      });
    });

    if (localSearch) {
      localSearch.addEventListener("input", applyFilters);
    }
  }
}());

(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function reset() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        reset();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        reset();
      });
    }

    show(0);
    play();
  }

  function setupSearch() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.search-panel'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('.site-search');
      var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
      var scope = panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var activeFilter = 'all';

      function normalize(value) {
        return String(value || '').toLowerCase();
      }

      function apply() {
        var keyword = normalize(input ? input.value : '');
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search') || card.textContent);
          var type = normalize(card.getAttribute('data-type'));
          var passKeyword = !keyword || text.indexOf(keyword) > -1;
          var passFilter = activeFilter === 'all' || type.indexOf(normalize(activeFilter)) > -1 || text.indexOf(normalize(activeFilter)) > -1;
          card.classList.toggle('hidden-card', !(passKeyword && passFilter));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeFilter = button.getAttribute('data-filter') || 'all';
          buttons.forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          apply();
        });
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var cover = shell.querySelector('.player-cover');
      var stream = shell.getAttribute('data-stream');
      var hls = null;
      var started = false;

      if (!video || !stream) {
        return;
      }

      function begin() {
        if (cover) {
          cover.hidden = true;
        }
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }
        video.src = stream;
        video.play().catch(function () {});
      }

      if (cover) {
        cover.addEventListener('click', begin);
      }

      video.addEventListener('click', function () {
        if (!started) {
          begin();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();

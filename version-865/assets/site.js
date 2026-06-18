(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function applyFilters(root) {
    var input = document.querySelector('[data-filter-input]');
    var select = document.querySelector('[data-filter-select]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-search]'));
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var year = select ? select.value : 'all';

    cards.forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !year || year === 'all' || cardYear === year;
      card.classList.toggle('hidden-by-filter', !(matchKeyword && matchYear));
    });
  }

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var filterInput = document.querySelector('[data-filter-input]');
    var filterSelect = document.querySelector('[data-filter-select]');
    var queryInput = document.querySelector('[data-query-input]');

    if (queryInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        queryInput.value = query;
      }
    }

    if (filterInput) {
      filterInput.addEventListener('input', function () {
        applyFilters(filterRoot);
      });
    }

    if (filterSelect) {
      filterSelect.addEventListener('change', function () {
        applyFilters(filterRoot);
      });
    }

    applyFilters(filterRoot);
  }

  function initPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var message = player.querySelector('.player-message');
    var source = player.getAttribute('data-video');
    var hls = null;
    var started = false;

    function setMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text || '';
      message.classList.toggle('show', Boolean(text));
    }

    function loadSource() {
      if (!video || !source || started) {
        return;
      }

      started = true;
      setMessage('');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放加载失败，请稍后重试');
            if (hls) {
              hls.destroy();
              hls = null;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function play() {
      loadSource();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (overlay) {
            overlay.classList.remove('hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove('hidden');
        }
      });
      video.addEventListener('click', function () {
        loadSource();
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.js-player')).forEach(initPlayer);
})();

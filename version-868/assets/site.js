
(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function debounce(fn, wait) {
    let timer = null;
    return function () {
      const ctx = this;
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(ctx, args);
      }, wait);
    };
  }

  function openMenu() {
    const toggle = $('[data-menu-toggle]');
    const mobile = $('[data-mobile-nav]');
    if (!toggle || !mobile) return;

    toggle.addEventListener('click', function () {
      mobile.classList.toggle('is-open');
    });
  }

  function initToTop() {
    const btn = $('[data-to-top]');
    if (!btn) return;

    const onScroll = function () {
      if (window.scrollY > 320) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initHeroSlider() {
    const slider = $('[data-hero-slider]');
    if (!slider) return;

    const slides = $all('[data-hero-slide]', slider);
    const nextBtn = $('[data-hero-next]', slider);
    const prevBtn = $('[data-hero-prev]', slider);
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
    }

    function next() {
      show(index + 1);
    }

    function prev() {
      show(index - 1);
    }

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    timer = setInterval(next, 5000);

    slider.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });

    slider.addEventListener('mouseleave', function () {
      timer = setInterval(next, 5000);
    });
  }

  function initPlayer() {
    const player = $('[data-movie-player]');
    if (!player) return;

    const video = $('video', player);
    const buttons = $all('[data-stream]', player);
    if (!video || !buttons.length) return;

    const mp4 = video.dataset.mp4;
    const m3u8 = video.dataset.m3u8;
    const notice = $('[data-player-notice]', player);

    function loadSource(kind) {
      buttons.forEach(function (btn) {
        btn.classList.toggle('is-active', btn.dataset.stream === kind);
      });

      const canNativeHls = video.canPlayType('application/vnd.apple.mpegurl');
      const selected = kind === 'hls' ? m3u8 : mp4;

      if (kind === 'hls' && window.Hls && typeof window.Hls.isSupported === 'function' && window.Hls.isSupported()) {
        if (window.__activeHls) {
          window.__activeHls.destroy();
          window.__activeHls = null;
        }
        const hls = new window.Hls();
        hls.loadSource(m3u8);
        hls.attachMedia(video);
        window.__activeHls = hls;
        if (notice) notice.textContent = '当前使用 HLS 线路播放。';
      } else {
        if (window.__activeHls) {
          window.__activeHls.destroy();
          window.__activeHls = null;
        }
        video.src = selected;
        if (kind === 'hls' && !canNativeHls && notice) {
          notice.textContent = '当前浏览器不支持 HLS.js 时，已自动切换到 MP4 备用线路。';
        } else if (notice) {
          notice.textContent = kind === 'hls' ? '当前使用 m3u8 线路，兼容 Safari 或 HLS 支持环境。' : '当前使用 MP4 备用线路。';
        }
      }

      video.load();
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        loadSource(btn.dataset.stream);
      });
    });

    loadSource('hls');
  }

  function initSearchPage() {
    const page = $('[data-search-page]');
    if (!page || !window.MOVIE_INDEX) return;

    const input = $('[data-search-input]', page);
    const typeSel = $('[data-search-type]', page);
    const regionSel = $('[data-search-region]', page);
    const sortSel = $('[data-search-sort]', page);
    const genreSel = $('[data-search-genre]', page);
    const countEl = $('[data-search-count]', page);
    const results = $('[data-search-results]', page);
    const defaultPageSize = 36;

    const data = window.MOVIE_INDEX.slice();

    function normalize(str) {
      return String(str || '').toLowerCase().replace(/\s+/g, '');
    }

    function movieMatches(movie, query) {
      if (!query) return true;
      const pool = [
        movie.t,
        movie.y,
        movie.tp,
        movie.rg,
        movie.g,
        (movie.tg || []).join(' '),
        movie.o,
        movie.s,
        movie.v
      ].join(' ');
      return normalize(pool).includes(normalize(query));
    }

    function render(list) {
      const total = list.length;
      if (countEl) {
        countEl.textContent = total.toLocaleString('zh-CN') + ' 部';
      }

      if (!results) return;

      if (!total) {
        results.innerHTML = '<div class="empty-state">没有找到匹配内容，试试更换关键词、类型或地区。</div>';
        return;
      }

      const html = list.slice(0, defaultPageSize).map(function (movie) {
        const tags = (movie.tg || []).slice(0, 3).map(function (tag) {
          return '<span class="chip">' + escapeHtml(tag) + '</span>';
        }).join('');
        const palette = paletteStyle(movie.t || movie.i);
        return [
          '<article class="movie-card">',
          '  <a class="movie-card__art" href="movie-' + movie.i + '.html" style="' + palette + '">',
          '    <span class="movie-card__badge">' + escapeHtml(movie.tp) + '</span>',
          '    <span class="movie-card__year">' + escapeHtml(movie.y) + '</span>',
          '    <div class="movie-card__title">' + escapeHtml(movie.t) + '</div>',
          '    <div class="movie-card__meta">' + escapeHtml(movie.rg) + ' · ' + escapeHtml(movie.g) + '</div>',
          '    <div class="movie-card__shine"></div>',
          '  </a>',
          '  <div class="movie-card__body">',
          '    <div class="chip-row">' + tags + '</div>',
          '    <p class="movie-card__summary">' + escapeHtml(movie.o || movie.s || '') + '</p>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');

      results.innerHTML = html;
    }

    function applyFilters() {
      let list = data.slice();

      const q = input ? input.value.trim() : '';
      const type = typeSel ? typeSel.value : '';
      const region = regionSel ? regionSel.value : '';
      const genre = genreSel ? genreSel.value : '';
      const sort = sortSel ? sortSel.value : 'score';

      if (q) list = list.filter(function (m) { return movieMatches(m, q); });
      if (type) list = list.filter(function (m) { return m.tp === type; });
      if (region) list = list.filter(function (m) { return m.rg === region; });
      if (genre) list = list.filter(function (m) { return (m.g || '').includes(genre) || (m.tg || []).includes(genre); });

      if (sort === 'year_desc') {
        list.sort(function (a, b) { return b.y - a.y || b.sc - a.sc; });
      } else if (sort === 'year_asc') {
        list.sort(function (a, b) { return a.y - b.y || b.sc - a.sc; });
      } else if (sort === 'title') {
        list.sort(function (a, b) { return a.t.localeCompare(b.t, 'zh-Hans-CN'); });
      } else {
        list.sort(function (a, b) { return b.sc - a.sc || b.y - a.y; });
      }

      render(list);
    }

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function paletteStyle(text) {
      let hash = 0;
      const s = String(text || '');
      for (let i = 0; i < s.length; i++) {
        hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
      }
      const hue = hash % 360;
      const hue2 = (hue + 26 + (hash % 33)) % 360;
      const hue3 = (hue + 180) % 360;
      return [
        '--g1:' + hslToHex(hue, 72, 52),
        '--g2:' + hslToHex(hue2, 68, 42),
        '--g3:' + hslToHex(hue3, 48, 24)
      ].join('; ');
    }

    function hslToHex(h, s, l) {
      s /= 100;
      l /= 100;
      const k = n => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = n => {
        const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return '#' + f(0) + f(8) + f(4);
    }

    const rerender = debounce(applyFilters, 120);

    [input, typeSel, regionSel, sortSel, genreSel].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', rerender);
      el.addEventListener('change', rerender);
    });

    applyFilters();
  }

  function initTabs() {
    const tabs = $all('[data-tab]');
    if (!tabs.length) return;
    const panels = $all('[data-tab-panel]');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const id = tab.dataset.tab;
        tabs.forEach(function (t) { t.classList.toggle('is-active', t === tab); });
        panels.forEach(function (panel) {
          panel.hidden = panel.dataset.tabPanel !== id;
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    openMenu();
    initToTop();
    initHeroSlider();
    initPlayer();
    initSearchPage();
    initTabs();
  });
})();

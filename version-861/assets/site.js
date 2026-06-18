(function () {
  const header = document.querySelector('.site-header');
  const drawer = document.querySelector('[data-mobile-drawer]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const searchInput = document.querySelector('[data-global-search]');
  const searchForm = document.querySelector('[data-search-form]');

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }

  function closeDrawer() {
    if (drawer) drawer.classList.remove('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function openDrawer() {
    if (drawer) drawer.classList.add('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  }

  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      const opened = drawer.classList.contains('is-open');
      opened ? closeDrawer() : openDrawer();
    });
    drawer.addEventListener('click', (ev) => {
      const target = ev.target.closest('a');
      if (target) closeDrawer();
    });
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (ev) => {
      const value = searchInput.value.trim();
      if (!value) return;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Search page enhancement
  const searchRoot = document.querySelector('[data-search-page]');
  if (searchRoot && Array.isArray(window.__MOVIES__)) {
    const results = searchRoot.querySelector('[data-results]');
    const count = searchRoot.querySelector('[data-result-count]');
    const qInput = searchRoot.querySelector('[data-q]');
    const regionSelect = searchRoot.querySelector('[data-region]');
    const typeSelect = searchRoot.querySelector('[data-type]');
    const genreSelect = searchRoot.querySelector('[data-genre]');
    const yearSelect = searchRoot.querySelector('[data-year]');
    const sortSelect = searchRoot.querySelector('[data-sort]');
    const pageBox = searchRoot.querySelector('[data-pagination]');
    const perPage = 36;

    const url = new URL(window.location.href);
    if (qInput && url.searchParams.get('q')) qInput.value = url.searchParams.get('q');

    let currentPage = 1;

    function normalize(text) {
      return String(text || '').toLowerCase().replace(/\s+/g, '');
    }

    function matches(movie) {
      const q = normalize(qInput ? qInput.value : '');
      const region = regionSelect ? regionSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      const genre = genreSelect ? genreSelect.value : '';
      const year = yearSelect ? yearSelect.value : '';

      if (region && movie.region !== region) return false;
      if (type && movie.type !== type) return false;
      if (year && String(movie.year) !== String(year)) return false;

      const hay = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags.join(' '),
        movie.one_line
      ].join(' '));

      if (q && !hay.includes(q)) return false;
      if (genre && !normalize(movie.genre).includes(normalize(genre))) return false;
      return true;
    }

    function sorted(list) {
      const mode = sortSelect ? sortSelect.value : 'latest';
      const out = [...list];
      if (mode === 'hot') {
        out.sort((a, b) => b.score - a.score || b.year - a.year || a.id - b.id);
      } else if (mode === 'old') {
        out.sort((a, b) => a.year - b.year || a.id - b.id);
      } else if (mode === 'title') {
        out.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'));
      } else {
        out.sort((a, b) => b.year - a.year || a.id - b.id);
      }
      return out;
    }

    function card(movie) {
      const meta = [movie.region, movie.type, movie.year, movie.genre].filter(Boolean).join(' · ');
      const tags = movie.tags.slice(0, 3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
      return `
        <article class="movie-card">
          <a class="movie-link" href="${movie.page}">
            <div class="poster">
              <img src="${movie.cover}" alt="${escapeHtml(movie.title)}">
              <span class="poster-badge">${escapeHtml(movie.theme_name)}</span>
              <span class="poster-badge right">${escapeHtml(movie.year)}</span>
            </div>
            <div class="movie-body">
              <h3 class="movie-title">${escapeHtml(movie.title)}</h3>
              <div class="movie-meta">${escapeHtml(meta)}</div>
              <p class="movie-summary">${escapeHtml(movie.one_line || movie.summary || '')}</p>
              <div class="tag-row" style="margin-top:10px">${tags}</div>
            </div>
          </a>
        </article>
      `;
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function render() {
      let list = window.__MOVIES__.filter(matches);
      list = sorted(list);
      const total = list.length;
      const pages = Math.max(1, Math.ceil(total / perPage));
      if (currentPage > pages) currentPage = pages;
      const start = (currentPage - 1) * perPage;
      const slice = list.slice(start, start + perPage);

      if (count) {
        count.textContent = `共 ${total} 部影片，当前第 ${currentPage} / ${pages} 页`;
      }

      if (results) {
        results.innerHTML = slice.length
          ? slice.map(card).join('')
          : `<div class="empty-state">没有找到符合条件的影片，请尝试更换关键词或筛选项。</div>`;
      }

      if (pageBox) {
        const nav = [];
        const make = (p, label, active = false, disabled = false) => {
          if (disabled) {
            nav.push(`<span>${label}</span>`);
          } else {
            nav.push(`<a href="#" data-page="${p}" class="${active ? 'active' : ''}">${label}</a>`);
          }
        };
        make(Math.max(1, currentPage - 1), '‹', false, currentPage === 1);
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(pages, currentPage + 2);
        if (startPage > 1) make(1, '1');
        if (startPage > 2) nav.push('<span>…</span>');
        for (let p = startPage; p <= endPage; p++) make(p, String(p), p === currentPage);
        if (endPage < pages - 1) nav.push('<span>…</span>');
        if (endPage < pages) make(pages, String(pages));
        make(Math.min(pages, currentPage + 1), '›', false, currentPage === pages);
        pageBox.innerHTML = `<div class="pagination">${nav.join('')}</div>`;
        pageBox.querySelectorAll('a[data-page]').forEach(a => {
          a.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = parseInt(a.dataset.page, 10) || 1;
            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        });
      }
    }

    [qInput, regionSelect, typeSelect, genreSelect, yearSelect, sortSelect].forEach(el => {
      if (!el) return;
      el.addEventListener('input', () => { currentPage = 1; render(); });
      el.addEventListener('change', () => { currentPage = 1; render(); });
    });

    render();
  }

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

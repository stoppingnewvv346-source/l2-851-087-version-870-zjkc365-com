(function () {
    var header = document.querySelector('[data-header]');
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var backTop = document.querySelector('[data-back-top]');

    function onScroll() {
        var scrolled = window.scrollY > 20;
        if (header) {
            header.classList.toggle('is-scrolled', scrolled);
        }
        if (backTop) {
            backTop.classList.toggle('is-visible', window.scrollY > 480);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (menuToggle && header) {
        menuToggle.addEventListener('click', function () {
            header.classList.toggle('is-open');
        });
    }

    if (backTop) {
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    initHero();
    initFilterPanels();
    initSearchPage();

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dotsWrap = hero.querySelector('[data-hero-dots]');
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        if (!slides.length || !dotsWrap) {
            return;
        }

        slides.forEach(function (_, index) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('aria-label', '切换到第 ' + (index + 1) + ' 张');
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
            dotsWrap.appendChild(dot);
        });

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function initFilterPanels() {
        Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var type = scope.querySelector('[data-filter-type]');
            var year = scope.querySelector('[data-filter-year]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var count = scope.querySelector('[data-filter-count]');

            function apply() {
                var keyword = normalize(input && input.value);
                var selectedType = type && type.value;
                var selectedYear = year && year.value;
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.genre,
                        card.dataset.tags,
                        card.dataset.type,
                        card.dataset.year
                    ].join(' '));
                    var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var okType = !selectedType || card.dataset.type === selectedType;
                    var okYear = !selectedYear || card.dataset.year === selectedYear;
                    var shouldShow = okKeyword && okType && okYear;

                    card.classList.toggle('is-hidden-by-filter', !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '显示 ' + visible + ' 部影片';
                }
            }

            [input, type, year].forEach(function (field) {
                if (field) {
                    field.addEventListener('input', apply);
                    field.addEventListener('change', apply);
                }
            });
        });
    }

    function initSearchPage() {
        var page = document.querySelector('[data-search-page]');
        if (!page || !window.MOVIES) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var input = document.querySelector('[data-search-page-input]');
        var title = page.querySelector('[data-search-title]');
        var count = page.querySelector('[data-search-count]');
        var results = page.querySelector('[data-search-results]');

        if (input) {
            input.value = query;
        }

        if (!query.trim()) {
            return;
        }

        var normalizedQuery = normalize(query);
        var matched = window.MOVIES.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(' '),
                movie.one_line,
                movie.summary
            ].join(' '));
            return haystack.indexOf(normalizedQuery) !== -1;
        }).slice(0, 240);

        if (title) {
            title.textContent = '搜索：“' + query + '”';
        }
        if (count) {
            count.textContent = '找到 ' + matched.length + ' 部影片';
        }
        if (results) {
            results.innerHTML = matched.length ? matched.map(renderCard).join('') : renderEmpty(query);
        }
    }

    function renderCard(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '    <a class="movie-poster" href="movie/movie-' + movie.uid + '.html" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '        <img src="' + movie.cover_no + '.jpg" alt="' + escapeHtml(movie.title) + '海报" loading="lazy">',
            '        <span class="poster-shade"></span>',
            '        <span class="play-dot">▶</span>',
            '        <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <div class="movie-meta-line">',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '            <span>' + escapeHtml(movie.year) + '</span>',
            '            <span>' + escapeHtml(movie.category_name) + '</span>',
            '        </div>',
            '        <h3><a href="movie/movie-' + movie.uid + '.html">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(truncate(movie.one_line || movie.summary || '', 100)) + '</p>',
            '        <div class="tag-row">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function renderEmpty(query) {
        return '<div class="quick-search-card"><div><span class="eyebrow dark">No Result</span><h2>未找到相关影片</h2><p>没有找到与“' + escapeHtml(query) + '”匹配的影片，可以尝试搜索地区、年份或题材关键词。</p></div></div>';
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function truncate(value, length) {
        value = String(value || '').replace(/\s+/g, ' ').trim();
        return value.length > length ? value.slice(0, length) + '…' : value;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
})();

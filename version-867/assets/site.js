(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            var expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expanded));
            mobileNav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('.js-hero-slider');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var current = 0;

        var activate = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                activate((current + 1) % slides.length);
            }, 5000);
        }
    }

    var form = document.querySelector('.js-search-form');
    var results = document.querySelector('.js-search-results');
    var status = document.querySelector('.js-search-status');
    var movies = window.SITE_MOVIES || [];

    if (form && results && status && movies.length) {
        var params = new URLSearchParams(window.location.search);
        ['q', 'region', 'genre', 'year'].forEach(function (key) {
            var field = form.elements[key];
            if (field && params.get(key)) {
                field.value = params.get(key);
            }
        });

        var card = function (movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="movie-card">',
                '<a class="movie-card__media" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="movie-card__year">' + escapeHtml(movie.year) + '</span>',
                '<span class="movie-card__play">▶</span>',
                '</a>',
                '<div class="movie-card__body">',
                '<a class="movie-card__title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
                '<div class="movie-card__meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</div>',
                '<p>' + escapeHtml(movie.oneLine) + '</p>',
                '<div class="tag-row">' + tags + '</div>',
                '</div>',
                '</article>'
            ].join('');
        };

        var runSearch = function () {
            var q = String(form.elements.q.value || '').trim().toLowerCase();
            var region = String(form.elements.region.value || '').trim();
            var genre = String(form.elements.genre.value || '').trim();
            var year = String(form.elements.year.value || '').trim();
            var filtered = movies.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.oneLine,
                    movie.tags.join(' ')
                ].join(' ').toLowerCase();
                var matchesKeyword = !q || haystack.indexOf(q) !== -1;
                var matchesRegion = !region || movie.region === region;
                var matchesGenre = !genre || movie.genres.indexOf(genre) !== -1 || movie.genre.indexOf(genre) !== -1;
                var matchesYear = !year || movie.year === year;
                return matchesKeyword && matchesRegion && matchesGenre && matchesYear;
            });

            var visible = filtered.slice(0, 120);
            results.innerHTML = visible.map(card).join('');
            status.textContent = visible.length ? '筛选结果' : '暂无匹配影片';
        };

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            runSearch();
        });

        if (window.location.search) {
            runSearch();
        }
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
})();

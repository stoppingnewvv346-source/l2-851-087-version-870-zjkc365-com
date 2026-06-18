window.DEFAULT_HLS_STREAM = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupHeader() {
        var header = $("[data-header]");
        var toggle = $("[data-menu-toggle]");
        var mobileNav = $("[data-mobile-nav]");

        function syncHeader() {
            if (!header) {
                return;
            }
            header.classList.toggle("is-scrolled", window.scrollY > 40);
        }

        syncHeader();
        window.addEventListener("scroll", syncHeader, { passive: true });

        if (toggle && mobileNav && header) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
                header.classList.toggle("is-open", mobileNav.classList.contains("is-open"));
            });
        }
    }

    function setupHero() {
        var hero = $("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = $all("[data-hero-slide]", hero);
        var dots = $all("[data-hero-dot]", hero);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupHeroSearch() {
        var form = $("[data-hero-search]");
        if (!form) {
            return;
        }
        var input = $("input", form);
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var query = input ? encodeURIComponent(input.value.trim()) : "";
            window.location.href = "./movies.html" + (query ? "?q=" + query : "");
        });
    }

    function setupFilters() {
        $all("[data-filter-panel]").forEach(function (panel) {
            var section = panel.closest("[data-listing]") || document;
            var search = $("[data-movie-search]", panel);
            var category = $("[data-category-filter]", panel);
            var year = $("[data-year-filter]", panel);
            var sort = $("[data-sort-filter]", panel);
            var count = $("[data-visible-count]", panel);
            var grid = $("[data-movie-grid]", section);
            var empty = $("[data-empty-state]", section);
            var cards = grid ? $all(".movie-card", grid) : [];
            var originalOrder = cards.slice();

            function applyQueryFromUrl() {
                if (!search) {
                    return;
                }
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    search.value = q;
                }
            }

            function sortCards(visibleCards) {
                if (!grid || !sort) {
                    return;
                }
                var mode = sort.value;
                var sorted = originalOrder.slice();

                if (mode === "score") {
                    sorted.sort(function (a, b) {
                        return parseFloat(b.dataset.score || "0") - parseFloat(a.dataset.score || "0");
                    });
                } else if (mode === "year") {
                    sorted.sort(function (a, b) {
                        return parseInt(b.dataset.year || "0", 10) - parseInt(a.dataset.year || "0", 10);
                    });
                } else if (mode === "title") {
                    sorted.sort(function (a, b) {
                        return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
                    });
                }

                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
            }

            function filter() {
                var query = normalize(search && search.value);
                var categoryValue = normalize(category && category.value);
                var yearValue = normalize(year && year.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.meta,
                        card.textContent
                    ].join(" "));
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesCategory = !categoryValue || normalize(card.dataset.category) === categoryValue;
                    var matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
                    var shouldShow = matchesQuery && matchesCategory && matchesYear;

                    card.classList.toggle("hidden-by-filter", !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                sortCards();

                if (count) {
                    count.textContent = String(visible);
                }
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [search, category, year, sort].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", filter);
                    control.addEventListener("change", filter);
                }
            });

            applyQueryFromUrl();
            filter();
        });
    }

    function setupPlayer() {
        var box = $("[data-player]");
        if (!box) {
            return;
        }

        var video = $("video", box);
        var button = $("[data-play-button]", box);
        var message = $("[data-player-message]");
        var stream = box.dataset.stream || window.DEFAULT_HLS_STREAM;
        var initialized = false;

        function setMessage(text) {
            if (message) {
                message.textContent = text;
            }
        }

        function playVideo() {
            if (!video || !stream) {
                setMessage("当前页面没有可用播放源。");
                return;
            }

            box.classList.add("is-playing");
            setMessage("正在加载 HLS 播放源...");

            if (!initialized) {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setMessage("HLS 播放源已就绪，可使用播放器控制条切换进度与音量。");
                        video.play().catch(function () {
                            setMessage("浏览器阻止了自动播放，请再次点击播放按钮。");
                        });
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage("播放源加载失败，请检查网络或替换 m3u8 地址。");
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    video.addEventListener("loadedmetadata", function () {
                        setMessage("原生 HLS 播放源已就绪。");
                        video.play().catch(function () {
                            setMessage("浏览器阻止了自动播放，请再次点击播放按钮。");
                        });
                    }, { once: true });
                } else {
                    setMessage("当前浏览器不支持 HLS 播放，请使用支持 MediaSource 的现代浏览器。");
                    return;
                }
                initialized = true;
            } else {
                video.play().catch(function () {
                    setMessage("请再次点击播放器控制条开始播放。");
                });
            }
        }

        if (button) {
            button.addEventListener("click", playVideo);
        }
    }

    function setupShareAndTop() {
        $all("[data-share]").forEach(function (button) {
            button.addEventListener("click", function () {
                var title = button.dataset.shareTitle || document.title;
                var text = button.dataset.shareText || "";
                if (navigator.share) {
                    navigator.share({
                        title: title,
                        text: text,
                        url: window.location.href
                    });
                } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href).then(function () {
                        button.textContent = "链接已复制";
                        window.setTimeout(function () {
                            button.textContent = "分享";
                        }, 1600);
                    });
                }
            });
        });

        $all("[data-back-top]").forEach(function (button) {
            button.addEventListener("click", function () {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupHeader();
        setupHero();
        setupHeroSearch();
        setupFilters();
        setupPlayer();
        setupShareAndTop();
    });
}());

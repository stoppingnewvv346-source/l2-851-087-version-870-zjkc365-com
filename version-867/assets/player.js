(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('.player-cover');
        var stream = player.getAttribute('data-stream');
        var started = false;
        var hls = null;

        var start = function () {
            if (!video || !stream) {
                return;
            }

            if (!started) {
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls();
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                video.controls = true;
            }

            if (cover) {
                cover.classList.add('is-hidden');
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        };

        if (cover) {
            cover.addEventListener('click', start);
        }

        player.addEventListener('click', function (event) {
            if (!started && event.target === video) {
                start();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();

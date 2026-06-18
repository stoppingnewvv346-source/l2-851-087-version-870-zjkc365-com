(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var message = player.querySelector('[data-player-message]');
            var hls = null;

            if (!video || !button) {
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }

            function startPlayback() {
                var source = video.dataset.src;

                if (!source) {
                    setMessage('未检测到播放源。');
                    return;
                }

                button.classList.add('is-hidden');
                setMessage('正在载入播放源…');

                if (window.Hls && window.Hls.isSupported()) {
                    if (hls) {
                        hls.destroy();
                    }
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setMessage('');
                        video.play().catch(function () {
                            setMessage('播放源已载入，点击播放器即可开始播放。');
                        });
                    });
                    hls.on(window.Hls.Events.ERROR, function (_, data) {
                        if (data && data.fatal) {
                            setMessage('播放源加载失败，请检查网络或稍后重试。');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        setMessage('');
                        video.play().catch(function () {
                            setMessage('播放源已载入，点击播放器即可开始播放。');
                        });
                    }, { once: true });
                } else {
                    setMessage('当前浏览器不支持 HLS 播放。');
                }
            }

            button.addEventListener('click', startPlayback);
        });
    });
})();

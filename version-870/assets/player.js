(function () {
  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("movie-player");
    var shell = document.querySelector("[data-video-shell]");
    var trigger = document.querySelector("[data-play-trigger]");
    var message = document.querySelector("[data-player-message]");
    var hls = null;

    if (!video || !shell || !trigger || !streamUrl) {
      return;
    }

    function showMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function attachStream() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.setAttribute("data-ready", "1");
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage("播放暂时不可用");
          }
        });
        video.setAttribute("data-ready", "1");
        return;
      }
      video.src = streamUrl;
      video.setAttribute("data-ready", "1");
    }

    function startPlay() {
      attachStream();
      shell.classList.add("is-ready");
      showMessage("");
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          shell.classList.remove("is-ready");
        });
      }
    }

    trigger.addEventListener("click", startPlay);
    video.addEventListener("play", function () {
      shell.classList.add("is-ready");
    });
    video.addEventListener("ended", function () {
      shell.classList.remove("is-ready");
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();

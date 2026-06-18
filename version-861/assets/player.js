import { H as Hls } from './hls.min.js';

function initPlayer() {
  const shell = document.querySelector('[data-player-shell]');
  const video = document.querySelector('[data-m3u8]');
  const button = document.querySelector('[data-play-button]');
  if (!shell || !video) return;

  const src = video.dataset.m3u8;
  let hls = null;

  function markPlaying() {
    shell.classList.add('is-playing');
  }

  function startPlayback() {
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {});
    }
  }

  if (button) {
    button.addEventListener('click', () => {
      startPlayback();
    });
  }

  video.addEventListener('play', markPlaying);
  video.addEventListener('playing', markPlaying);
  video.addEventListener('pause', () => {
    shell.classList.remove('is-playing');
  });

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
  } else if (Hls && Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 30
    });
    hls.loadSource(src);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      // ready
    });
  } else {
    video.src = src;
  }

  shell.addEventListener('click', (ev) => {
    const target = ev.target;
    if (target && target.closest && target.closest('[data-play-button]')) return;
    startPlayback();
  });
}

document.addEventListener('DOMContentLoaded', initPlayer);

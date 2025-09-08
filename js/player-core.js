// player-core.js
let player;
let currentVideoSources = [];
let currentQuality = '1080p';

function initPlayer() {
  const isMobile = window.innerWidth <= 768;
  player = new Plyr('#player', {
    controls: isMobile
      ? ['play-large', 'rewind', 'play', 'fast-forward', 'mute', 'progress', 'current-time', 'captions', 'settings', 'pip', 'airplay', 'fullscreen']
      : ['play-large', 'rewind', 'play', 'fast-forward', 'mute', 'progress', 'current-time', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
    settings: ['captions', 'speed'],
    resetOnEnd: false,
    keyboard: { focused: true, global: true },
    tooltips: { controls: true, seek: true },
    seekTime: 10,
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/plyr/3.7.8/plyr.svg',
    blankVideo: 'https://cdn.plyr.io/static/blank.mp4',
  });

  player.on('ready', () => hideLoading());
  player.on('loadstart', () => showLoading());
  player.on('canplay', () => hideLoading());
  player.on('error', () => {
    hideLoading();
    showToast('Error playing video. Please try another quality or source.');
  });

  player.on('ended', handleVideoEnded);
}

function loadVideo(initialUrl) {
  if (!player) return;
  showLoading();
  const poster = playerData.image;
  const currentTime = player.currentTime || 0;

  const sources = currentVideoSources.map(source => ({
    src: source.url,
    type: 'video/mp4',
    size: parseInt(source.quality.replace('p', ''))
  }));

  const tracks = (playerData.captions || []).map(caption => ({
    kind: 'subtitles',
    label: caption.label,
    srclang: caption.srclang,
    src: caption.src,
    default: caption.default || false
  }));

  player.source = {
    type: 'video',
    title: playerData.title,
    sources: sources,
    poster: poster,
    tracks: tracks
  };

  player.once('canplay', () => {
    player.currentTime = currentTime;
    player.play().catch(err => {
      showToast('Playback error. Trying fallback…');
      tryFallback();
    });
    hideLoading();
  });

  player.once('error', () => {
    showToast('Video load error. Trying fallback…');
    tryFallback();
  });
}

function tryFallback() {
  const fallback = currentVideoSources.find(src => src.quality === '720p');
  if (!fallback) return;
  player.source = {
    type: 'video',
    sources: [{
      src: fallback.url,
      type: 'video/mp4',
      size: 720
    }],
    poster: playerData.image
  };
  player.play().catch(err => {
    console.error('Fallback failed:', err);
    showToast('Fallback failed. No video available.');
    hideLoading();
  });
}

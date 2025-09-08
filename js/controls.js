// controls.js
function setupDownloadButton() {
  const downloadBtn = document.getElementById('downloadBtn');
  downloadBtn.addEventListener('click', downloadVideo);
}

async function downloadVideo() {
  let urlToDownload = null;
  let filename = `${playerData.title}.mp4`;
  let fallbackUrl = null;

  if (currentEpisodeId && episodes.length > 0) {
    const episode = episodes[currentEpisodeIndex];
    urlToDownload = episode.videoUrl;
    fallbackUrl = episode.lookUrl || episode.altVideoUrl || null;
    filename = `${playerData.title}-S${episode.season}E${episode.episode}.mp4`;
  } else if (playerData.video) {
    if (currentVideoSources.length > 1) {
      const activeSource = currentVideoSources.find(src => src.quality === currentQuality);
      urlToDownload = activeSource ? activeSource.url : playerData.video;
      filename = `${playerData.title}-${currentQuality}.mp4`;
    } else {
      urlToDownload = playerData.video;
    }
    fallbackUrl = playerData.lookUrl || playerData[`${currentQuality}Url`] || null;
  }

  if (!urlToDownload) {
    showToast('No video available for download');
    return;
  }

  const hasToken = urlToDownload.includes('h=') && urlToDownload.includes('e=');

  if (hasToken) {
    showToast('Checking download link...');
    try {
      const res = await fetch(urlToDownload, { method: 'HEAD' });
      if (res.ok) {
        triggerDownload(urlToDownload, filename);
      } else {
        throw new Error('Link expired');
      }
    } catch (err) {
      console.warn('Token-protected download failed:', err);
      fallbackOrNotify(fallbackUrl);
    }
  } else {
    triggerDownload(urlToDownload, filename);
  }
}

function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Download started!');
}

function fallbackOrNotify(fallbackUrl) {
  if (fallbackUrl) {
    showToast('Download expired. Open fallback manually.');
    const open = confirm('Download link expired.\n\nOpen fallback page to download manually?');
    if (open) window.open(fallbackUrl, '_blank');
  } else {
    showToast('No fallback link available.');
  }
}

function copyStreamUrl() {
  let urlToCopy;
  if (currentEpisodeId && episodes.length > 0) {
    urlToCopy = episodes[currentEpisodeIndex].videoUrl;
  } else if (currentVideoSources.length > 0) {
    const activeSource = currentVideoSources.find(source => source.quality === currentQuality);
    urlToCopy = activeSource ? activeSource.url : currentVideoSources[0].url;
  }
  if (urlToCopy) {
    navigator.clipboard.writeText(urlToCopy)
      .then(() => showToast('Stream URL copied to clipboard!'))
      .catch(err => {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy URL');
      });
  }
}

// Share button using Web Share API
document.getElementById('shareBtn')?.addEventListener('click', () => {
  if (navigator.share) {
    const shareData = {
      title: playerData.title || 'PanguPlay',
      text: `Watch now: ${playerData.title}`,
      url: window.location.href
    };
    navigator.share(shareData).catch(err => {
      console.warn('Share failed:', err);
      showToast('Sharing failed.');
    });
  } else {
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast('Link copied to clipboard!'))
      .catch(err => {
        console.warn('Copy failed:', err);
        showToast('Unable to share or copy link.');
      });
  }
});

// Stream button opens stream URL in new tab
document.getElementById('streamBtn')?.addEventListener('click', () => {
  let streamUrl = null;

  if (currentEpisodeId && episodes.length > 0) {
    streamUrl = episodes[currentEpisodeIndex]?.videoUrl;
  } else if (currentVideoSources.length > 0) {
    const activeSource = currentVideoSources.find(src => src.quality === currentQuality);
    streamUrl = activeSource?.url || currentVideoSources[0].url;
  }

  if (streamUrl) {
    window.open(streamUrl, '_blank');
  } else {
    showToast('Stream URL not found.');
  }
});


let castPlayer = null;

function initializeCastApi() {
  cast.framework.CastContext.getInstance().setOptions({
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
  });

  document.getElementById('castBtn')?.addEventListener('click', async () => {
    const context = cast.framework.CastContext.getInstance();
    await context.requestSession();

    const castSession = context.getCurrentSession();
    const mediaInfo = new chrome.cast.media.MediaInfo(getActiveVideoUrl(), 'video/mp4');
    mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.title = playerData.title || 'PanguPlay';

    const request = new chrome.cast.media.LoadRequest(mediaInfo);
    castSession?.loadMedia(request).then(
      () => showToast('Casting started!'),
      (err) => {
        console.error('Cast load error:', err);
        showToast('Cast failed.');
      }
    );
  });
}

function getActiveVideoUrl() {
  if (currentEpisodeId && episodes.length > 0) {
    return episodes[currentEpisodeIndex].videoUrl;
  } else if (currentVideoSources.length > 0) {
    const activeSource = currentVideoSources.find(src => src.quality === currentQuality);
    return activeSource?.url || currentVideoSources[0].url;
  }
  return '';
}

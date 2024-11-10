console.log('Sensor content script loaded', browser, window.sensorValue, window);

let currentTitle = 'Unknown';
let isPlaying = 'Unknown';

function triggerUpdateMessage() {
  console.log('Sensor content. Send message to background', currentTitle, isPlaying);
  browser.runtime.sendMessage({ action: 'media_tracker_update', title: currentTitle, isPlaying });
}

function updateTitle() {
  const oldValue = currentTitle;

  let header = document.getElementsByTagName('ytd-watch-metadata')[0];

  if (header) {
    let titleWrapper = header.querySelector('div[id="title"]');

    if (titleWrapper) {
      currentTitle = titleWrapper.getElementsByTagName('h1')[0].innerText;
    } else {
      currentTitle = 'Unknown';
    }
  } else {
    currentTitle = 'Unknown';
  }

  return oldValue === currentTitle;
}

function updatePlayingStatus() {
  const oldValue = isPlaying;
  const player = document.getElementsByTagName('video')[0];

  if (player) {
    isPlaying = !player.paused;
  } else {
    isPlaying = 'Unknown';
  }

  return isPlaying === oldValue;
}


let interval;


function updateInterval(isEnabled) {
  console.log('Sensor content. updateInterval', isEnabled);
  if (isEnabled && !interval) {
    interval = setInterval(() => {
      try {
        const isTitleChanged = updateTitle();
        const isPlayingChanged = updatePlayingStatus();

        if ([isTitleChanged, isPlayingChanged].some(val => val)) {

          triggerUpdateMessage();
        }
      } catch (e) {}
    }, 2500);
  } else if (isEnabled && interval) {
    clearInterval(interval);
    interval = null;
  }
}

function onMessage(message) {
  console.log('Sensor content. onMessage', message);
  if (message.action === 'extension_enable_changed') {
    updateInterval(message.isEnabled);
  }

  if (message.action === 'extension_is_enabled') {
    updateInterval(message.isEnabled);
  }
}

browser.runtime.sendMessage({ action: 'request_extension_is_enabled' }).then(onMessage);

browser.runtime.onMessage.addListener(function messageListener(message, sender, sendResponse) {
  onMessage(message);
});

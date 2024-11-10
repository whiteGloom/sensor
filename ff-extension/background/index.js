let isEnabled = false;

const generated_id = Math.random().toString(36).substring(2, 15);

const trackedTabs = {};

function areStatesDifferent(oldState, newState) {
  if (oldState.title !== newState.title) return true;
  if (oldState.isPlaying !== newState.isPlaying) return true;
  if (oldState.tabTitle !== newState.tabTitle) return true;
  return oldState.source !== newState.source;
}

browser.runtime.onMessage.addListener(
  function messageListener(message, sender, sendResponse) {
    console.log('Sensor background. onMessage', message, sender, sendResponse);
    const tabId = sender.tab.id;
    if (!trackedTabs[tabId]) {
      trackedTabs[tabId] = {};
    }

    if ('media_tracker_update' === message.action) {
      if (isEnabled) {
        let source;

        if (sender.tab.url && sender.tab.url.includes('youtube.com/watch')) {
          source = 'Youtube';
        } else {
          source = 'Unknown';
        }

        const newState = {
          title: message.title,
          isPlaying: message.isPlaying,
          tabTitle: sender.tab.title,
          source: source,
        };

        if (areStatesDifferent(trackedTabs[tabId], newState)) {
          trackedTabs[tabId] = newState;

          const data = {
            type: 'browser_extension',
            source_id: `browser_${generated_id}`,
            tracker_id: tabId, // 'browser_1_1'
            meta: {
              title: newState.title,
              isPlaying: newState.isPlaying,
              type: newState.source,
              tabId: tabId,
              tabTitle: newState.tabTitle,
            }
          };

          fetch('http://localhost:3300/media_tracker_update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
          }).then(
            () => {
              console.log('Request update success', data);
            },
            () => {
              console.log('Request update error', data);
            }
          );
        }
      }
    }

    if ('request_extension_is_enabled' === message.action) {
      sendResponse({action: 'extension_is_enabled', isEnabled});
      return true;
    }
  },
);

browser.action.onClicked.addListener((tabData, onClickData) => {
  isEnabled = !isEnabled;
  browser.action.setBadgeText({text: isEnabled ? 'ON' : 'OFF'});

  for (let key in trackedTabs) {
    browser.tabs.sendMessage(+key, {action: 'extension_enable_changed', isEnabled});
  }
});

browser.tabs.onRemoved.addListener(({tabId}) => {
  fetch('http://localhost:3300/media_tracker_remove', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      id: `browser_${generated_id}_${tabId}`,
    }),
  }).then(
    () => {
      console.log('Request delete success', `browser_${generated_id}_${tabId}`);
    },
    () => {
      console.log('Request delete error', `browser_${generated_id}_${tabId}`);
    }
  );

  delete trackedTabs[tabId];
});

function initialize() {
  browser.action.setBadgeText({text: isEnabled ? 'ON' : 'OFF'});
}

initialize();

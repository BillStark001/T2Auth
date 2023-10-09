import { handleMessage } from './common/message';
import './page/sw';

async function bgMain() {

  // register option changed listener
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
      console.log(`[${key}]: ${JSON.stringify(oldValue)} -> ${JSON.stringify(newValue)}`);
      if (namespace === 'local') {
        throw new Error(
          'This should never happen. Please contact the developers.'
        );
      }
    }
  });

  chrome.runtime.onMessage.addListener(handleMessage);
}

bgMain();

chrome.runtime.onConnect.addListener((port) => {
  console.log(`Connection to background established on port ${port.name}.`);
});








import m, { ComponentTypes as C } from 'mithril';
import { autoSetLanguage } from './view';
import { tryConnect } from './common/message';

const PageView: C<object, object> = {
  view() {
    return m('div', [
      m('a', { href: 'https://portal.nap.gsic.titech.ac.jp/', target: '_blank' }, ['Open Login Page']),
    ]);

  },
};

async function popupMain() {
  await tryConnect();
  await autoSetLanguage();
  m.mount(document.getElementById('app')!, PageView);
}

let port = chrome.runtime.connect({
  name: 'popup page',
});
port.onDisconnect.addListener(() => {
  console.log('Disconnected from background');
  port = chrome.runtime.connect({
    name: 'popup page',
  });
});

popupMain().catch(console.error);
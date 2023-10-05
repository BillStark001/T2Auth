import m from 'mithril';
import { MadeByView, TitleView } from './common/controls';
import { AuthInfoOptions } from './pages/authinfo';

const PageView: m.ComponentTypes = {
  view() {
    return m('div', [
      m(TitleView, { page: 'Options Page' }),
      m(AuthInfoOptions),
      m(MadeByView),
    ]);
  },
};

async function optionsMain() {
  m.mount(document.getElementById('app')!, PageView);
}

let port = chrome.runtime.connect({
  name: 'options page',
});
port.onDisconnect.addListener(() => {
  console.log('Disconnected from background');
  port = chrome.runtime.connect({
    name: 'options page',
  });
});

optionsMain().catch(console.error);
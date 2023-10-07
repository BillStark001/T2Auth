import m from 'mithril';
import { FooterView, HeaderView } from './view/general';
import { LoginInfoPanel } from './page/logininfo';
import { OptionsPanel } from './page/options';

const PageView: m.ComponentTypes = {
  view() {
    return m('div', [
      m(HeaderView, { page: 'Options Page' }),
      m('div.std-border', m(LoginInfoPanel)),
      m('div.std-border', m(OptionsPanel)),
      m(FooterView),
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
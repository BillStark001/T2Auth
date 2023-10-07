import m from 'mithril';
import { FooterView, HeaderView } from './view/general';
import { LoginInfoPanel } from './page/logininfo';
import { OptionsPanel } from './page/options';

const PageView: m.ComponentTypes = {
  view() {
    return m('div', [
      m(HeaderView, { page: 'Options Page' }),
      m('div.std-border.pure-g.page-frame', [
        m('div.pure-u-1.page-item-1-2', m(LoginInfoPanel)),
        m('div.pure-u-1.page-item-1-2', m(OptionsPanel)),
      ]),
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
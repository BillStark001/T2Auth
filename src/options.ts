import m, { ComponentTypes as C } from 'mithril';
import { Footer, Header, Layout, MenuItem } from './view/layout';
import { LoginInfoPanel } from './page/logininfo';
import { OptionsPanel } from './page/options';
import { t } from './common/lang/i18n';
import { autoSetLanguage } from './view';
import { tryConnect } from './common/message';

type _S = {
  page: 'options' | 'loginInfo',
};
const _S_page: _S['page'][] = ['options', 'loginInfo'];

const PageView: C<object, _S> = {
  oninit(vnode) {
    vnode.state.page = 'options';
  },
  view(vnode) {
    const { page } = vnode.state;
    const setPage = (p: _S['page']) => { vnode.state.page = p; };

    return m(Layout, {
      menuItems: [{
        heading: { display: t('menu.title') },
        items: _S_page.map(x => ({
          display: t(`menu.${x}`),
          selected: (page === x),
          onclick: () => { setPage(x); },
        }) as MenuItem)
      }],
      headerSubtitle: t(`page.${page}.title`),
    }, [
      page === 'options' && m(OptionsPanel),
      page === 'loginInfo' && m(LoginInfoPanel),
    ].filter(x => !!x));

    return m('div', [
      m(Header, { subtitle: 'Options Page' }),
      m('div.std-border.pure-g.page-frame', [
        m('div.pure-u-1.page-item-1-2', m(LoginInfoPanel)),
        m('div.pure-u-1.page-item-1-2', m(OptionsPanel)),
      ]),
      m(Footer),
    ]);
  },
};

async function optionsMain() {
  await tryConnect();
  await autoSetLanguage();
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
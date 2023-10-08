
import { t } from '@/common/lang/i18n';
import { VnodeLike } from '@/common/utils';
import m, { ComponentTypes as C } from 'mithril';

// header, footer

export const Header: C<{ subtitle?: VnodeLike }> = {
  view(vnode) {
    return m('div.header', [
      m('h1', t('meta.app.name')),
      m('h2', vnode.attrs.subtitle)
    ]);
  }
};

export const Footer: C = {
  view() {
    return m('div', {
      style: {
        margin: 'auto',
        textAlign: 'center',
        fontSize: '10px'
      }
    }, [
      m('p', t('meta.app.footer', { author: t('meta.app.author') }))
    ]);
  }
};

// menu

export type MenuItem = {
  href?: string,
  display: VnodeLike,
  selected?: boolean,
  onclick?: (e: Event) => void | Promise<void>,
};

export type MenuStructure = {
  heading: MenuItem,
  items: MenuItem[],
};

export type MenuAttrs = {
  items: MenuStructure[],
  active?: boolean,
  ontoggle?: (e: Event) => void | Promise<void>,
};


export const Menu: C<MenuAttrs> = {
  view(vnode) {
    const { items, active, ontoggle } = vnode.attrs;
    const activeClass = active ? '.active' : '';
    return [
      m('a.menu-link' + activeClass, { onclick: ontoggle }, [
        m('span')
      ]),
      m('div.menu-container' + activeClass, {
        onclick: active ? ontoggle : undefined,
      }, items.map(
        ({ heading, items: subItems }) =>
          m('.pure-menu', [
            m('a.pure-menu-heading',
              { ...heading, display: undefined },
              heading.display),
            m('ul.pure-menu-list', subItems.map((item) =>
              m('li.pure-menu-item' + (item.selected ? '.menu-item-divided.pure-menu-selected' : ''), [
                m('a.pure-menu-link',
                  { ...item, display: undefined, selected: undefined },
                  item.display)
              ]))),
          ]),
      ))
    ];
  },
};

// framework

type _S_L = {
  active: boolean;
};

export type LayoutAttrs = {
  menuItems: MenuStructure[],
  headerSubtitle: VnodeLike,
}

export const Layout: C<LayoutAttrs, _S_L> = {
  oninit(vnode) {
    vnode.state.active = false;
  },
  view(vnode) {
    const { menuItems, headerSubtitle } = vnode.attrs;
    return m('.layout' + (vnode.state.active ? '.active' : ''), [
      m(Menu, {
        items: menuItems,
        active: vnode.state.active,
        ontoggle: () => { vnode.state.active = !vnode.state.active; },
      }),
      m('div#main', {
        onclick: () => {
          if (vnode.state.active)
            vnode.state.active = false;
        }
      }, [
        m(Header, {
          subtitle: headerSubtitle,
        }),
        m('div.content', vnode.children),
        m(Footer),
      ]),
    ]);
  }
};



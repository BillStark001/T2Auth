import { t } from '@/common/lang/i18n';
import m, { ComponentTypes as C } from 'mithril';

export const Button: C<{
  text: string,
  click?: (ev: MouseEvent) => void,
}> = {
  view(vnode) {
    return m('input', {
      type: 'button',
      id: 'input',
      value: vnode.attrs.text,
      onclick: vnode.attrs.click,
    });
  },
};

export const HeaderView: C<{ page?: string }> = {
  view(vnode) {
    return m('div', {
      style: {
        margin: 'auto',
        textAlign: 'center'
      }
    }, [
      m('p.header-title', {}, t('meta.app.name')),
      vnode.attrs.page && m('p.header-subtitle', {}, vnode.attrs.page)
    ]);
  }
};

export const FooterView: C = {
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


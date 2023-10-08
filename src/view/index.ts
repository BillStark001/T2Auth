import m, { ComponentTypes as C } from 'mithril';
import { VnodeLike } from '@/common/utils';
import Portal from 'mithril-portal';
import { getLanguage } from '@/page/sw';
import { changeLanguage } from '@/common/lang/i18n';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import style from './view.module.css';

export type ModalAttrs = {
  header?: undefined | string | (() => VnodeLike),
  isOpen?: boolean,
  onclose: () => void | Promise<void>,
};

export const Modal: C<ModalAttrs> = {
  view(vnode) {
    const { isOpen, onclose, header } = vnode.attrs;
    if (!isOpen)
      return undefined;
    return m(Portal, [
      m('div.' + style['modal-overlay'], 
        m('div.' + style['modal'], [
          m('div.' + style['modal-header'], [
            header && typeof header === 'function' ? header() : m('h2', header),
            m('span.' + style['close-button'], { onclick: () => onclose() }, '×')
          ]),
          m('div.' + style['modal-body'], vnode.children),
        ]),
      )
    ]);
  },
};

export const Button: C<{
  text?: string,
  click?: (ev: MouseEvent) => void,
}> = {
  view(vnode) {
    return m('button.button-small.pure-button', {
      onclick: vnode.attrs.click,
    }, vnode.attrs.text, vnode.children);
  },
};

export const autoSetLanguage = async () => {
  const lang = await getLanguage();
  window.localStorage.removeItem('i18nextLng');
  changeLanguage(lang || undefined);
};


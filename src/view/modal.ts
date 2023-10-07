import { VnodeLike } from '@/common/utils';
import m, { ComponentTypes as C } from 'mithril';
import Portal from 'mithril-portal';

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
      m('div.modal-overlay', 
        m('div.modal', [
          m('div.modal-header', [
            header && typeof header === 'function' ? header() : m('h2', header),
            m('span.close-button', { onclick: () => onclose() }, '×')
          ]),
          m('div.modal-body', vnode.children),
        ]),
      )
    ]);
  },
};
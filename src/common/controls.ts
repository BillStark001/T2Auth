import m from 'mithril';
import { ComponentTypes as C } from 'mithril';

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

export const TitleView: C<{ page?: string }> = {
  view(vnode) {
    return m('div', {
      style: {
        margin: 'auto',
        textAlign: 'center'
      }
    }, [
      m('p.header-title', {}, 'Tokyo Tech Authentication Kit'),
      vnode.attrs.page && m('p.header-subtitle', {}, vnode.attrs.page)
    ]);
  }
};

export const MadeByView: C = {
  view: function() {
    return m('div', {
      style: {
        margin: 'auto',
        textAlign: 'center',
        fontSize: '10px'
      }
    }, [
      m('p', 'Made by Bill Stark')
    ]);
  }
};


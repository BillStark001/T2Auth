import { CourseInfoScheme, getOcwParsedData } from '@/data/course';
import { Button } from '@/view/general';
import { Modal } from '@/view/modal';
import m, { ComponentTypes as C } from 'mithril';

const OcwView: C<object, {
  modal: boolean,
  data: CourseInfoScheme,
}> = {
  oninit(vnode) {
    vnode.state.modal = false;
    vnode.state.data = getOcwParsedData();
  },
  view(vnode) {
    return m('div.t2auth-anchor', [
      m('link', { rel: 'stylesheet', href: chrome.runtime.getURL('/controls.css') }),
      m(Button, {
        text: 'Generate iCalendar',
        click() { vnode.state.modal = true; }
      }),
      m(Modal, {
        isOpen: vnode.state.modal, 
        onclose() {
          vnode.state.modal = false;
        }, 
        header: 'Generate iCalendar'
      }, [
        m('pre', JSON.stringify(vnode.state.data, null, 2))
      ])
    ]);
  },
};


export const mountOnOcwPage = () => {
  const container = document.querySelector('#sysbtns');
  if (!container)
    return;
  const anchor = document.createElement('div');
  if (container.childNodes.length > 0)
    container.insertBefore(anchor, container.childNodes[0]);
  else
    container.appendChild(anchor);
  m.mount(anchor, OcwView);
};
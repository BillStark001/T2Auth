import { CourseInfoScheme, getEwsParsedData } from '@/data/course';
import { OptionsScheme, getDefaultOptions } from '@/data/model';
import { getOptions } from '@/page/sw';
import { Modal } from '@/view';
import m, { ComponentTypes as C } from 'mithril';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import style from './mixin.module.css';
import { t } from '@/common/lang/i18n';
import { CalendarGeneratorView } from '@/view/cal-gen';


const EwsView: C<object, {
  modal: boolean,
  data: CourseInfoScheme[],
  timeTable: Record<string, [string, string]>,
  options: OptionsScheme,
}> = {
  oninit(vnode) {
    vnode.state.modal = false;
    [vnode.state.data, vnode.state.timeTable] = getEwsParsedData();
    vnode.state.options = getDefaultOptions();
    getOptions().then((o) => {
      vnode.state.options = o;
      m.redraw();
    });
  },
  view(vnode) {
    return m('div.t2auth-anchor', [
      m('link', { rel: 'stylesheet', href: chrome.runtime.getURL('/pure-min.css') }),
      // m('link', { rel: 'stylesheet', href: chrome.runtime.getURL('/style.css') }),
      m('button.' + style['btn'], {
        onclick(e: Event) { 
          e.preventDefault();
          vnode.state.modal = true; 
        }
      }, t('mixin.ocw.calGen')),
      m(Modal, {
        isOpen: vnode.state.modal,
        onclose() {
          vnode.state.modal = false;
        },
        header: t('mixin.ocw.calGen')
      }, [
        vnode.state.data ? m(CalendarGeneratorView, { 
          data: vnode.state.data, 
          periodStart: vnode.state.options.periodStart,
          quarterInterval: vnode.state.options.quarterInterval,
        }) : undefined,
      ])
    ]);
  },
};

export const mountOnEwsPage = () => {
  const container = document.querySelector('#menuPrint');
  if (!container)
    return;
  const anchor = document.createElement('div');
  if (container.childNodes.length > 0)
    container.insertBefore(anchor, container.childNodes[0]);
  else
    container.appendChild(anchor);
  m.mount(anchor, EwsView);
};
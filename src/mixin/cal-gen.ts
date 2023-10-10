import { CourseInfoScheme, getEwsParsedData, getOcwParsedData } from '@/data/course';
import { Modal } from '@/view';
import m, { ComponentTypes as C } from 'mithril';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

import { t } from '@/common/lang/i18n';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import style from './mixin.module.css';
import { getOptions, setOptions } from '@/page/sw';
import { OptionsScheme, getChangedQuarterInterval, getDefaultOptions, getDefaultQuarterInterval } from '@/data/model';
import { CalendarGeneratorView } from '../view/cal-gen';

type _A = {
  data: CourseInfoScheme[],
  timeTable: Record<string, [string, string]>,
};

type _S = {
  modal: boolean,
  options: OptionsScheme,
};

const CalGenView: C<_A, _S> = {
  oninit(vnode) {
    vnode.state.options = getDefaultOptions();
    vnode.state.modal = false;
    getOptions().then((o) => {
      vnode.state.options = o;
      m.redraw();
    });
  },
  view(vnode) {
    const { options, modal } = vnode.state;
    return m('div.t2auth-anchor', [
      m('link', { rel: 'stylesheet', href: chrome.runtime.getURL('/pure-min.css') }),
      // m('link', { rel: 'stylesheet', href: chrome.runtime.getURL('/style.css') }),
      m('button.' + style['btn'], {
        onclick(e: Event) { 
          e.preventDefault();
          vnode.state.modal = true; 
        }
      }, t('mixin.ocw.calGen.trigger')),
      m(Modal, {
        isOpen: modal,
        onclose() {
          vnode.state.modal = false;
        },
        header: t('mixin.ocw.calGen.title')
      }, [
        vnode.attrs.data ? m(CalendarGeneratorView, { 
          data: vnode.attrs.data, 
          periodStart: options.periodStart,
          quarterInterval: options.quarterInterval,
          async onQuarterIntervalChange(ay, q, value, start) {
            const newIntervals = getChangedQuarterInterval(
              options.quarterInterval[ay] ?? getDefaultQuarterInterval(ay),
              q, value, start
            );
            await setOptions({ quarterInterval: { 
              ...options.quarterInterval, 
              [ay]: newIntervals 
            }});
            vnode.state.options = await getOptions();
            m.redraw();
          },
        }) : undefined,
      ])
    ]);
  },
};

const _O: C<object, _A> = {
  oninit(vnode) {
    vnode.state.data = [getOcwParsedData()];
    vnode.state.timeTable = {};
  },
  view: (vnode) => m(CalGenView, vnode.state),
};

const _E: C<object, _A> = {
  oninit(vnode) {
    [vnode.state.data, vnode.state.timeTable] = getEwsParsedData();
  },
  view: (vnode) => m(CalGenView, vnode.state),
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
  m.mount(anchor, _O);
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
  m.mount(anchor, _E);
};
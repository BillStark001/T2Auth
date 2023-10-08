import { CourseInfoScheme, DayPeriodScheme, getOcwParsedData } from '@/data/course';
import { Modal } from '@/view';
import m, { ComponentTypes as C } from 'mithril';

import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

import { VnodeLike, VnodeObj, range } from '@/common/utils';
import { Calendar } from '@/view/calendar';
import { t } from '@/common/lang/i18n';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import style from './ocw.module.css';

const durationMap: [number, number][] = [
  [-1, -1],
  [3, 2], [5, 2], [9, 2], [11, 2], [3, 4], [9, 4]
];

type _A = {
  data: CourseInfoScheme
};
type _S = {
  quarter: number,
  startRange: Dayjs,
  endRange: Dayjs,
  startDate: Dayjs,
  endDate: Dayjs,
  jump: Map<string, boolean[]>,
};

const refreshQuarter = (vnode: VnodeObj<_A, _S>, y: number, q: number) => {
  const [ds, de] = durationMap[q];
  const quarterStart = dayjs(new Date(y, ds, 1, 0, 0, 0)).tz('Asia/Tokyo');
  console.log(quarterStart, quarterStart.toISOString());
  Object.assign(vnode.state, {
    quarter: q,
    startRange: quarterStart,
    endRange: quarterStart.add(de, 'months').add(7, 'days'),
    startDate: quarterStart,
    endDate: quarterStart.add(de, 'months'),
    jump: new Map(),
  } as _S);
};

const CalendarCellView: C<{
  date: Dayjs,
  inSemester: boolean,
  periods: DayPeriodScheme[],
  jump: boolean[],
  onSelectStart?: () => void,
  onSelectEnd?: () => void,
  onJumpChange: (index: number, value: boolean) => void,
}> = {
  view(vnode) {
    const { date, inSemester, periods, jump, onSelectStart, onSelectEnd, onJumpChange } = vnode.attrs;
    return m('div', [
      m('div', String(date.date())),
      m('div', [
        onSelectStart ? m('button.' + style['btn'], { onclick: () => onSelectStart() }, t('mixin.ocw.cal.start')) : undefined,
        onSelectEnd ? m('button.' + style['btn'], { onclick: () => onSelectEnd() }, t('mixin.ocw.cal.end')) : undefined,
      ]),
      inSemester && periods ? m('div', periods.map(({ periodStart, periodEnd, location }, i) => {
        return m('div', [
          m(jump[i] ? 'del' : 'span', `P${periodStart}-${periodEnd}, ${location}`),
          m('button.' + style['btn'], { onclick: () => onJumpChange(i, !jump[i]) },
            t(jump[i] ? 'mixin.ocw.cal.noJump' : 'mixin.ocw.cal.jump')
          )
        ]);
      })) : undefined,
    ]);
  },
};

const CalendarGeneratorView: C<_A, _S> = {

  oninit(vnode) {
    const { ay, quarters: quarter } = vnode.attrs.data;
    refreshQuarter(vnode, ay, quarter[0] ?? 1);
  },

  view(vnode) {
    const { ay, quarters, periods } = vnode.attrs.data;
    const { startRange, endRange, startDate, endDate, jump } = vnode.state;
    const periodsByDate = range(7).map((i) => periods.filter(x => x.day == i));
    return [

      m('div', [
        m('span', t('mixin.ocw.cal.title', { year: ay, quarter: t(`meta.quarter.${vnode.state.quarter}`) })),
        quarters.length > 1 ? m('select', {
          value: vnode.state.quarter,
          onchange: (e: Event) => refreshQuarter(vnode, ay,
            Number((e.target as HTMLSelectElement).value))
        }, quarters.map(q => m('option', { value: q }, t(`meta.quarter.${q}`)))) : undefined,
      ]),

      m(Calendar, {
        start: startRange,
        end: endRange,
        rowView(weekStart) {
          return [[
            (weekStart.isAfter(startDate.startOf('week').add(-1, 'day')) && weekStart.isBefore(endDate)) ?
              m('span', t('mixin.ocw.cal.weekIndex', {
                index: weekStart.diff(startDate.startOf('week'), 'week') + 1,
              })) : m('span', t('mixin.ocw.cal.weekOut')),
            m('br'),
            m('span', t('mixin.ocw.cal.weekRange', {
              start: weekStart.add(1, 'day').format(t('meta.date.md')),
              end: weekStart.add(5, 'days').format(t('meta.date.md')),
            }))
          ], undefined];
        },
        cellView(date) {
          const isoStr = date.toISOString();

          const afterStart = date.isAfter(startDate.add(-1, 'day'));
          const beforeEnd = date.isBefore(endDate.add(1, 'day'));
          const inSemester = afterStart && beforeEnd;
          const curPeriods = periodsByDate[date.day()];
          const jumpedCount = (jump.get(isoStr) ?? []).filter(x => !!x).length;
          
          return [m(CalendarCellView, {
            date,
            inSemester,
            periods: curPeriods,
            jump: [...jump.get(isoStr) ?? []],
            onJumpChange(index, value) {
              const arr = [...jump.get(isoStr) ?? []];
              arr[index] = value;
              jump.set(isoStr, arr);
              m.redraw();
            },
            onSelectStart: beforeEnd ? () => {
              vnode.state.startDate = date;
              m.redraw();
            } : undefined,
            onSelectEnd: afterStart ? () => {
              vnode.state.endDate = date;
              m.redraw();
            } : undefined,
          }) as unknown as VnodeLike, [
            style['cal-cell'],
            style[
              inSemester ? curPeriods.length ? (
                jumpedCount == 0 ? 'course' : jumpedCount == curPeriods.length ? 'course-c': 'course-p'
              ) : 'general' : 'disabled'
            ]]];
        },
      }, []),

      m('div', m('button.' + style['btn'], {
        onclick: () => {
          console.log(startDate, endDate, periodsByDate, jump);
        }
      }, t('mixin.ocw.calGen'))),
    ];
  },
};

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
      m('link', { rel: 'stylesheet', href: chrome.runtime.getURL('/mixin.css') }),
      m('link', { rel: 'stylesheet', href: chrome.runtime.getURL('/general.css') }),
      m('button.' + style['btn'], {
        onclick() { vnode.state.modal = true; }
      }, t('mixin.ocw.calGen')),
      m(Modal, {
        isOpen: vnode.state.modal,
        onclose() {
          vnode.state.modal = false;
        },
        header: t('mixin.ocw.calGen')
      }, [
        vnode.state.data ? m(CalendarGeneratorView, { data: vnode.state.data }) : undefined,
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
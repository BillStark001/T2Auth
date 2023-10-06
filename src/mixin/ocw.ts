import { CourseInfoScheme, DayPeriodScheme, getOcwParsedData } from '@/data/course';
import { Button } from '@/view/general';
import { Modal } from '@/view/modal';
import m, { ComponentTypes as C } from 'mithril';
import dayjs, { Dayjs } from 'dayjs';
import { VnodeObj, range } from '@/common/utils';
import { Calendar } from '@/view/calendar';

const quarterMap = ['', '1Q', '2Q', '3Q', '4Q', '1-2Q', '3-4Q'];
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
  const quarterStart = dayjs(new Date(y, ds, 1));
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
  periods: DayPeriodScheme[],
  jump: boolean[],
  onSelectStart: () => void,
  onSelectEnd: () => void,
  onJumpChange: (index: number, value: boolean) => void,
}> = {
  view(vnode) {
    const { periods, jump, onSelectStart, onSelectEnd, onJumpChange } = vnode.attrs;
    return m('div', [
      m('div', [
        m('button', { onclick: () => onSelectStart() }, 'Start'),
        m('button', { onclick: () => onSelectEnd() }, 'End'),
      ]),
      m('div', periods.map(({ periodStart, periodEnd, location }, i) => {
        return m('div', [
          `P${periodStart}-${periodEnd}, ${location}`,
          m('button', { onclick: () => onJumpChange(i, !jump[i]) },
            jump[i] ? 'No Jump' : 'Jump'
          )
        ]);
      }))
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
    const { startRange, endRange, jump } = vnode.state;
    const periodsByDate = range(7).map((i) => periods.filter(x => x.day == i));
    return [
      m('div', [
        m('span', `Calendar of AY ${ay}, `),
        m('select', {
          value: vnode.state.quarter,
          onchange: (e: Event) => refreshQuarter(vnode, ay,
            Number((e.target as HTMLSelectElement).value))
        }, quarters.map(q => m('option', { value: q }, quarterMap[q])))
      ]),
      m(Calendar, {
        start: startRange,
        end: endRange,
        rowView(weekStart) {
          return m('span', `${weekStart.format('YYYY-MM-DD')} - ${weekStart.add(6, 'days').format('YYYY-MM-DD')}`);
        },
        cellView(date): m.Vnode {
          return m(CalendarCellView, {
            periods: periodsByDate[date.day()],
            jump: jump.get(date.toISOString()) ?? [],
            onJumpChange(index, value) {
              const arr = [...jump.get(date.toISOString()) ?? []];
              arr[index] = value;
              jump.set(date.toISOString(), arr);
            },
            onSelectStart() {
                
            },
            onSelectEnd() {
                
            },
          }) as unknown as m.Vnode;
        },
      }, [])
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
        // m('pre', JSON.stringify(vnode.state.data, null, 2)),
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
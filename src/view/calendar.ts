import m from 'mithril';
import { ComponentTypes as C } from 'mithril';
import dayjs, { Dayjs } from 'dayjs';
import { range } from '@/common/utils';



export type CalendarAttrs = {
  start?: Dayjs,
  end?: Dayjs, // included
  rowView?: (weekStart: Dayjs) => m.Vnode,
  cellView?: (date: Dayjs) => m.Vnode,
};

export const Calendar: C<CalendarAttrs> = {
  view(vnode) {
    const { start: _start, end: _end, rowView, cellView } = vnode.attrs;
    const start = _start ?? (dayjs().startOf('month'));
    const end = _end && _end.isAfter(start) ? _end : start.add(1, 'month');
    const firstWeek = start.startOf('week');
    const weekDiff = end.diff(firstWeek, 'week');

    return m('table.calendar',
      m('tr.cal-row.header', range(rowView ? -1 : 0, 7).map(i => i == -1 ?
        m('th') : m('th', `#${i}`)
      )),
      range(weekDiff).map((i) => {
        const weekStart = firstWeek.add(i, 'weeks');
        const cells = range(rowView ? -1 : 0, 7).map((j) => j == -1 ?
          m('td.cal-cell.row-view', rowView!(weekStart)) :
          m('td.cal-cell', cellView ? cellView(weekStart.add(j, 'days')) : ''));
        return m('tr.cal-row', cells);
      })
    );

  },
};
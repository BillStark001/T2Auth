import m from 'mithril';
import { ComponentTypes as C } from 'mithril';
import dayjs, { Dayjs } from 'dayjs';
import { VnodeLike, range } from '@/common/utils';
import { t } from '@/common/lang/i18n';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import style from './calendar.module.css';


export type CalendarAttrs = {
  start?: Dayjs,
  end?: Dayjs, // included
  rowView?: (weekStart: Dayjs) => [VnodeLike, string[] | undefined],
  cellView?: (date: Dayjs) => [VnodeLike, string[] | undefined],
};

const _m = (tag: string, obj: [VnodeLike, string[] | undefined]) => {
  const [node, classes] = obj;
  return m([tag, ...classes ?? []].join('.'), node);
};

export const Calendar: C<CalendarAttrs> = {
  view(vnode) {
    const { start: _start, end: _end, rowView, cellView } = vnode.attrs;
    const start = _start ?? (dayjs().startOf('month'));
    const end = _end && _end.isAfter(start) ? _end : start.add(1, 'month');
    const firstWeek = start.startOf('week');
    const weekDiff = Math.ceil(end.diff(firstWeek, 'week', true));

    return m('table.' + style['calendar'],
      m('tr.cal-row.header', range(rowView ? -1 : 0, 7).map(i => i == -1 ?
        m('th') : m('th', t(`meta.weekDay.brief.${i}`))
      )),
      range(weekDiff).map((i) => {
        const weekStart = firstWeek.add(i, 'weeks');
        const cells = range(rowView ? -1 : 0, 7).map((j) => j == -1 ?
          _m('td.cal-cell.row-view', rowView!(weekStart)) :
          _m('td.cal-cell', cellView ? cellView(weekStart.add(j, 'days')) : ['', undefined]));
        return m('tr.cal-row', cells);
      })
    );

  },
};
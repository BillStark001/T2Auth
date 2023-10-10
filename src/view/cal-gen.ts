import { CourseInfoScheme, DayPeriodScheme } from '@/data/course';
import m, { ComponentTypes as C } from 'mithril';

import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

import { VnodeObj, range, saveToFile, truncateString } from '@/common/utils';
import { Calendar } from '@/view/calendar';
import { t } from '@/common/lang/i18n';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import style from './cal-gen.module.css';
import { generateCalendarFile } from '@/data/calendar';
import { OptionsScheme, getCurrentAcademicYear, getDefaultQuarterInterval } from '@/data/model';

const durationMap: [number, number][] = [
  [-1, -1],
  [3, 2], [5, 2], [9, 2], [11, 2], [3, 4], [9, 4]
];

const quarterContains = (x: number, y: number) => {
  if (x === 5)
    return y === 1 || y === 2 || y === 5;
  if (x === 6)
    return y === 3 || y === 4 || y === 6;
  return x === y;
};

type _A_C = {
  date: Dayjs,
  inSemester: boolean,
  periods: PeriodsCache,
  jump: Record<string, boolean[]>,
  onJumpChange: (code: string, index: number, value: boolean) => void,
};

const CalendarCellView: C<_A_C> = {
  view(vnode) {
    const { date, inSemester, periods, jump, onJumpChange } = vnode.attrs;
    return m('div', [
      m('div', String(date.date())),
      inSemester && periods ? m('div', periods.map(
        ([{ code }, { periodStart, periodEnd }, i, name]) => {
          const jumped = jump[code][i];
          return m('div', [
            m(jumped ? 'del' : 'span', 
              t('meta.period', { period: `${periodStart}-${periodEnd}` }) + ' ' + 
              truncateString(name, 12),
            ),
            m('button.' + style['btn'], {
              onclick: (e: Event) => {
                e.preventDefault();
                onJumpChange(code, i, !jumped);
              }
            },
            t(jumped ? 'mixin.ocw.cal.noJump' : 'mixin.ocw.cal.jump')
            )
          ]);
        })) : undefined,
    ]);
  },
};



export type CalendarGeneratorAttrs = {
  periodStart: [string, string][],
  quarterInterval: OptionsScheme['quarterInterval'],
  onQuarterIntervalChange?: (ay: number, q: number, value: string, start: boolean) => void | Promise<void>;
  data: CourseInfoScheme[],
};
type _S = {
  quarterList: [number, number][],
  ay: number,
  quarter: number,
  jump: Record<string, Map<string, boolean>[]>, // [code][index](date): jump?
};


const refreshQuarter = async (vnode: VnodeObj<CalendarGeneratorAttrs, _S>, ay: number, quarter: number) => {
  Object.assign(vnode.state, {
    ay,
    quarter,
  } as _S);
};

const getQuarterInterval = (qi: OptionsScheme['quarterInterval'], ay: number, quarter: number): [string, string] => {
  const curInterval = qi[ay] ?? getDefaultQuarterInterval(ay);
  const [ivStart, ivEnd] = quarter > 4 ?
    [curInterval[(quarter - 4) * 2 - 1][0], curInterval[(quarter - 4) * 2][1]] :
    curInterval[quarter];
  return [ivStart, ivEnd];
};

const getQuarterIntervalByCourse = (
  qi: OptionsScheme['quarterInterval'], 
  dispAy: number,
  dispQuarter: number, 
  course: CourseInfoScheme) => {
  const ans: [Dayjs, Dayjs][] = [];
  for (const q of course.quarters) {
    if (dispAy != course.ay || (q <= 4 && !quarterContains(dispQuarter, q)))
      continue;
    const [ivStart, ivEnd] = getQuarterInterval(qi, course.ay, q);
    ans.push([
      _d(ivStart),
      _d(ivEnd),
    ]);
  }
  
  return ans;
};

const _d = (s: string) => dayjs(new Date(s).setHours(0)).tz('Asia/Tokyo');

type PeriodsCache = [CourseInfoScheme, DayPeriodScheme, number, string][];

export const CalendarGeneratorView: C<CalendarGeneratorAttrs, _S> = {

  oninit(vnode) {

    const quarterRecord: Set<string> = new Set();
    vnode.attrs.data.forEach(
      (d) => d.quarters.forEach(
        (q) => quarterRecord.add(JSON.stringify([d.ay, q]))
      )
    );

    // quarter list
    const quarterList = [...quarterRecord].sort()
      .map(x => JSON.parse(x) as [number, number]);
    if (quarterList.length == 0) {
      quarterList.push([getCurrentAcademicYear(), 1]);
    }
    vnode.state.quarterList = quarterList;

    // set init values
    vnode.state.jump = Object.fromEntries(vnode.attrs.data.map(
      (d) => [d.code, range(d.periods.length).map(() => new Map())]
    ));
    const [ay, quarter] = quarterList[0];
    refreshQuarter(vnode, ay, quarter);
  },

  view(vnode) {

    const curAy = getCurrentAcademicYear();

    const { data, periodStart, quarterInterval, onQuarterIntervalChange } = vnode.attrs;
    const { quarterList, ay, quarter, jump } = vnode.state;

    // interval setter
    const [ms, dm] = durationMap[quarter];
    const meRaw = ms + dm;
    const ey = meRaw > 12 ? ay + 1 : ay;
    const me = meRaw % 12;
    const durStart = `${ay.toFixed(0).padStart(4, '0')}-${(ms + 1).toFixed(0).padStart(2, '0')}-01`;
    const durEnd = `${ey.toFixed(0).padStart(4, '0')}-${(me + 1).toFixed(0).padStart(2, '0')}-10`;

    const curInterval = quarterInterval[ay] ?? getDefaultQuarterInterval(ay);
    const [ivStart, ivEnd] = getQuarterInterval(quarterInterval, ay, quarter);

    // convert date to dayjs
    const startRange = _d(durStart);
    const endRange = _d(durEnd);
    const startDate = _d(ivStart);
    const endDate = _d(ivEnd);

    // calculate periods
    const _range7 = range(7);
    const periodsByDate: PeriodsCache[] = _range7.map(() => []);
    for (const info of data) {
      const { ay: ayCourse, quarters, periods, titleJa, titleEn } = info;
      if (ayCourse != ay || quarters.filter((q) => quarterContains(quarter, q)).length == 0)
        continue;
      for (let i = 0; i < periods.length; ++i) {
        const period = periods[i];
        periodsByDate[period.day].push([info, period, i, titleJa || titleEn]);
      }
    }

    const _i = (value: string, ay: number, quarter: number, start: boolean) => m('input[type=date]', {
      value,
      min: durStart,
      max: durEnd,
      oninput: onQuarterIntervalChange ?
        (e: InputEvent) => onQuarterIntervalChange(
          ay, quarter, (e.target as HTMLInputElement).value, start) : undefined,
    });

    // handle special cases when the user chooses 2 quarters
    const quarter1 = quarter <= 4 ? quarter : ((quarter - 4) * 2 - 1);
    const quarter2 = quarter <= 4 ? undefined : ((quarter - 4) * 2);
    const [ivStart1, ivEnd1] = quarter <= 4 ? ['2001-01-01', '2001-01-01'] : curInterval[quarter1];
    const [ivStart2, ivEnd2] = quarter <= 4 ? ['2001-01-01', '2001-01-01'] : curInterval[quarter2!];
    const q1End = _d(ivEnd1).add(1, 'day');
    const q2Start = _d(ivStart2).add(-1, 'day');
    const l1: PeriodsCache[] = quarter <= 4 ? [] : periodsByDate.map(c => c.filter(
      ([{ quarters }]) => quarters.filter((q) => q === quarter1).length > 0
    ));
    const l2: PeriodsCache[] = quarter <= 4 ? [] : periodsByDate.map(c => c.filter(
      ([{ quarters }]) => quarters.filter((q) => q === quarter2).length > 0
    ));
    const l3: PeriodsCache[] = quarter <= 4 ? [] : periodsByDate.map(c => c.filter(
      ([{ quarters }]) => quarters.filter((q) => q === quarter).length > 0
    ));

    const getCurrentPeriods: (d: Dayjs) => PeriodsCache = 
      quarter <= 4 ? (d) => periodsByDate[d.day()] : (d) =>{
        const dd = d.day();
        const ret = [...l3[dd]];
        if (d.isAfter(q2Start))
          ret.push(...l2[dd]);
        if (d.isBefore(q1End))
          ret.push(...l1[dd]);
        return ret;
      };

    // generate view
    return m('form.pure-form.pure-form-aligned', [

      m('h2.' + style['content-subhead'], t('view.calGen.section.settings')),
      m('fieldset', [
        // quarter selector
        m('div.pure-control-group', [
          m('label', t('view.calGen.quarter')),
          m('select', {
            value: JSON.stringify([ay, quarter]),
            onchange: (e: Event) => {
              try {
                const [y, q] = JSON.parse((e.target as HTMLSelectElement).value);
                refreshQuarter(vnode, y ?? getCurrentAcademicYear(), q ?? 1);
              } finally {
                // do nothing
              }
            }
          }, quarterList.map(([y, q]) => m('option',
            { value: JSON.stringify([y, q]) },
            t('meta.ay', { ay: y }) + ' ' + t(`meta.quarter.${q}`)
          )))
        ]),
        // interval setter
        quarter2 != undefined ? undefined : m('div.pure-control-group', [
          m('label', t('view.calGen.interval')),
          m('span', [
            _i(ivStart, ay, quarter, true),
            '-',
            _i(ivEnd, ay, quarter, false),
          ])
        ])
      ]),

      // interval setter for semester
      quarter2 == undefined ? undefined : m('h2.' + style['content-subhead'], t('view.calGen.interval')),
      quarter2 == undefined ? undefined : m('fieldset', [
        m('div.pure-control-group', [
          m('label', t(`meta.quarter.${quarter1}`)),
          m('span', [
            _i(ivStart1, ay, quarter1, true),
            ' - ',
            _i(ivEnd1, ay, quarter1, false),
          ])
        ]),
        m('div.pure-control-group', [
          m('label', t(`meta.quarter.${quarter2}`)),
          m('span', [
            _i(ivStart2, ay, quarter2, true),
            ' - ',
            _i(ivEnd2, ay, quarter2, false),
          ])
        ])
      ]),
      

      m('h2.' + style['content-subhead'], t('view.calGen.section.content')),

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
          ], [style['cal-cell']]];
        },
        cellView(date) {
          const isoStr = date.toISOString();

          const afterStart = date.isAfter(startDate.add(-1, 'day'));
          const beforeEnd = date.isBefore(endDate.add(1, 'day'));
          const inSemester = afterStart && beforeEnd;
          const curPeriods = getCurrentPeriods(date);
          const jumpedMap = Object.fromEntries(data.map(({ code }) => [code, jump[code].map(d => !!d.get(isoStr))]));
          const jumpedCount = Object.entries(jumpedMap)
            .reduce((i, [, v]) => i + v.filter(x => x).length, 0);

          return [m(CalendarCellView, {
            date,
            inSemester,
            periods: curPeriods,
            jump: jumpedMap,
            onJumpChange(code, index, value) {
              jump[code][index].set(isoStr, value);
              m.redraw();
            },
          } as _A_C), [
            style['cal-cell'],
            style[
              inSemester ? curPeriods.length ? (
                jumpedCount == 0 ? 'course' : jumpedCount == curPeriods.length ? 'course-c' : 'course-p'
              ) : 'general' : 'disabled'
            ]]
          ];
        },
      }, []),

      m('div', m('button.pure-button.' + style['btn-gen'], {
        onclick: (e: Event) => {
          e.preventDefault();
          const ics = generateCalendarFile(
            vnode.attrs.data.filter(({ ay: ayRaw, quarters }) => {
              const ayCourse = ayRaw < 0 ? curAy : ayRaw;
              return (ayCourse == ay && quarters.filter((q) => quarterContains(quarter, q)).length > 0);
            }),
            (c) => getQuarterIntervalByCourse(quarterInterval, ay, quarter, c),
            Object.fromEntries(Object.entries(jump).map(
              ([c, n]) => [c, n.map(
                (m) => [...m.keys()].filter(k => !!m.get(k)).map(x => dayjs(x))
              )]
            )),
            periodStart,
          );
          const blob = new Blob([ics], {
            type: 'text/plain;charset=utf-8',
          });
          saveToFile(blob, `courses_${ay}_${quarter}.ics`);
        }
      }, t('mixin.ocw.calGen.title'))),
    ]);
  },
};
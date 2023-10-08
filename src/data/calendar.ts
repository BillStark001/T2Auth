import { Dayjs } from 'dayjs';
import { CourseInfoScheme } from './course';
import ICAL from 'ical.js';
import { parseTimeInput } from '@/common/utils';

const DAY_DICT = Object.freeze(['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']);

export const generateCalendarFile = (
  info: CourseInfoScheme,
  startDate: Dayjs,
  endDate: Dayjs,
  jump: Dayjs[][],
  periodStart: [string, string][],
) => {

  const jcal = new ICAL.Component('vcalendar');
  const title = info.code + ' ' + info.titleJa || info.titleEn;

  for (let i = 0; i < info.periods.length; ++i) {
    const p = info.periods[i];
    const [hStart, mStart] = parseTimeInput(periodStart[p.periodStart]?.[0] ?? '') ?? [0, 0];
    const [hEnd, mEnd] = parseTimeInput(periodStart[p.periodEnd]?.[1] ?? '') ?? [hStart, mStart];
    const firstLectureDay = startDate.add((7 + p.day - startDate.day()) % 7, 'days');

    const event = new ICAL.Component('vevent');

    event.addPropertyWithValue('summary', title);
    event.addPropertyWithValue('dtstart', ICAL.Time.fromJSDate(firstLectureDay.add(hStart * 60 + mStart, 'minutes').toDate()));
    event.addPropertyWithValue('dtend', ICAL.Time.fromJSDate(firstLectureDay.add(hEnd * 60 + mEnd, 'minutes').toDate()));
    const recurrenceRule = new ICAL.Recur({
      freq: 'WEEKLY',
      byday: DAY_DICT[p.day],
      byhour: [hStart],
      byminute: [mStart],
      until: ICAL.Time.fromJSDate(endDate.toDate()),
    });
    event.addPropertyWithValue('rrule', recurrenceRule);
    if (jump[i]?.length)
      jump[i].map(d => event.addPropertyWithValue('exdate', ICAL.Time.fromJSDate(d.add(hStart * 60 + mStart, 'minutes').toDate())));

    jcal.addSubcomponent(event);
  }

  const text = jcal.toString();
  return text;
};
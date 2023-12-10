import { Dayjs } from 'dayjs';
import { CourseInfoScheme } from './course';
import ICAL from 'ical.js';
import { parseTimeInput } from '@/common/utils';
import { LocationMap, LocationMapEn } from '@/common/meta';

const DAY_DICT = Object.freeze(['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']);

export const generateCourseEvents = (
  info: CourseInfoScheme,
  startDate: Dayjs,
  endDate: Dayjs,
  jump: Dayjs[][], // [index]: date[]
  periodStart: [string, string][],
) => {


  const isJa = !!info.titleJa;
  const title = info.code + ' ' + (isJa ? info.titleJa : info.titleEn).replace(/\s*\r?\n/g, ' ');

  const ans: ICAL.Component[] = [];

  for (let i = 0; i < info.periods.length; ++i) {
    const p = info.periods[i];
    const [hStart, mStart] = parseTimeInput(periodStart[p.periodStart]?.[0] ?? '') ?? [0, 0];
    const [hEnd, mEnd] = parseTimeInput(periodStart[p.periodEnd]?.[1] ?? '') ?? [hStart, mStart];
    const firstLectureDay = startDate.add((7 + p.day - startDate.day()) % 7, 'days');

    const event = new ICAL.Component('vevent');
    const desc: string[] = [];

    // course info
    desc.push(`${info.code} ${isJa ? info.titleJa : info.titleEn}`);
    desc.push(`${info.ay} ${info.quarters.join(',')}Q`);

    // time & period

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

    // location info.

    const [location, lng, lat] = (isJa ? LocationMap : LocationMapEn)[p.location] ?? [undefined, undefined, undefined];

    event.addPropertyWithValue('location', location ? p.location + ' ' + location : p.location);

    if (p.longitude && p.latitude) {
      event.addPropertyWithValue('geo', `${p.latitude};${p.longitude}`);
      event.addPropertyWithValue('location', `${p.latitude},${p.longitude}`);
      if (p.location)
        desc.push(p.location);
      if (location)
        desc.push(location);
    } else if (lng && lat) {
      event.addPropertyWithValue('geo', `${lat};${lng}`);
      event.addPropertyWithValue('location', `${lat},${lng}`);
      if (p.location)
        desc.push(p.location);
      if (location)
        desc.push(location);
    } else {
      event.addPropertyWithValue('location', (location ?? '') + p.location);
    }

    event.addPropertyWithValue('description', desc.join('\n'));

    ans.push(event);
  }
  return ans;
};

export const generateCalendarFile = (
  data: CourseInfoScheme[],
  dateGetter: (course: CourseInfoScheme) => [Dayjs, Dayjs][],
  jump: Record<string, Dayjs[][]>, // [index]: date[]
  periodStart: [string, string][],
) => {

  const calendar = new ICAL.Component('vcalendar');
  
  for (const info of data) {
    const dates = dateGetter(info);
    for (const [startDate, endDate] of dates) {
      generateCourseEvents(info, startDate, endDate, jump[info.code] ?? [], periodStart)
        .forEach((c) => calendar.addSubcomponent(c));
    }
  }

  const text = calendar.toString();
  console.log(text);
  return text;
};
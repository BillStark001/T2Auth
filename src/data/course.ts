import { EwsRawData, getEwsRawData, getOcwRawData } from './html-parser';

const reDayPeriod = /(月|火|水|木|金|土|日|Mon|Tue|Wed|Thu|Thur|Thr|Fri|Sat|Sun)(\d{1,2})(?:-(\d{1,2}))?/g;

export type DayPeriodScheme = {
  day: number;
  periodStart: number;
  periodEnd: number;
  location: string;
  longitude?: number;
  latitude?: number;
};

export type CourseInfoScheme = {
  code: string;
  titleJa: string;
  titleEn: string;
  ay: number;
  quarters: number[];
  periods: DayPeriodScheme[];
  __raw__: Record<string, string>;
};

const dayMap: Record<string, number> = Object.freeze({
  '日': 0,
  '月': 1,
  '火': 2,
  '水': 3,
  '木': 4,
  '金': 5,
  '土': 6,
  'Sun': 0,
  'Mon': 1,
  'Tue': 2,
  'Wed': 3,
  'Thu': 4,
  'Thur': 4,
  'Thr': 4,
  'Fri': 5,
  'Sat': 6,
});

const reLeftPar = /^\s*\(/;
const reRightPar = /\)\s*$/;



export const parseDayPeriod = (inStr: string) => {
  const ret: DayPeriodScheme[] = [];
  reDayPeriod.lastIndex = 0;
  let exec: RegExpExecArray | null = null;
  const execRes: [number, number, number, number, number][] = [];
  while ((exec = reDayPeriod.exec(inStr))) {
    if (execRes.length > 0)
      execRes[execRes.length - 1][1] = exec.index;
    execRes.push([
      exec.index + exec[0].length,
      -1,
      dayMap[exec[1]] ?? -1,
      Number(exec[2]),
      Number(exec[3] ?? exec[2]),
    ]);
  }
  if (execRes.length > 0)
    execRes[execRes.length - 1][1] = inStr.length;
  for (const [ls, le, day, periodStart, periodEnd] of execRes) {
    const locationRaw = inStr.substring(ls, le);
    reLeftPar.lastIndex = 0;
    reRightPar.lastIndex = 0;
    const location = (reLeftPar.test(locationRaw) && reRightPar.test(locationRaw)) ?
      locationRaw.replace(reLeftPar, '').replace(reRightPar, '') :
      locationRaw.trim();
    ret.push({ location, day, periodStart, periodEnd });
  }
  return ret;
};

export const parseAcademicQuarter = (strIn: string) => {

  const str: string = strIn.replace('Q', '').trim();
  const retRaw: [boolean, boolean, boolean, boolean] = [false, false, false, false];
  let last_d: number = 0;
  let bar: boolean = false;

  for (const d of str) {
    try {
      const cur_d: number = parseInt(d) - 1;
      retRaw[cur_d] = true;
      if (bar) {
        for (let dd = last_d; dd < cur_d; dd++) {
          retRaw[dd] = true;
        }
      }
      last_d = cur_d;
    } catch {
      if (d === '-' || d === '~') {
        bar = true;
      }
    }
  }
  const ret: number[] = [];
  if (retRaw[0] && retRaw[1]) {
    ret.push(5);
    retRaw[0] = false;
    retRaw[1] = false;
  }
  if (retRaw[2] && retRaw[3]) {
    ret.push(6);
    retRaw[2] = false;
    retRaw[3] = false;
  }
  retRaw.forEach((x, i) => x && ret.push(i + 1));
  ret.sort();
  return ret;
};


export const getOcwParsedData = (raw?: Record<string, string>): CourseInfoScheme => {
  raw = raw ?? getOcwRawData();

  const titleRaw = raw.__title__ ?? '';
  const parsedTitle = ['', ''];
  if (/^\d{1,4}年度/.test(titleRaw)) {
    const _title = titleRaw.replace(/^\d{1,4}年度\s*/, '').split('\xa0\xa0\xa0');
    parsedTitle[0] = _title[0].trim();
    parsedTitle[1] = _title[1]?.trim() ?? '';
  } else {
    parsedTitle[1] = titleRaw.replace(/^\d{1,4}\s*/, '').trim();
  }

  const periods = parseDayPeriod(raw['曜日・時限(講義室)'] ?? raw['Day/Period(Room No.)'] ?? '');
  const code = raw['科目コード'] ?? raw['Course number'] ?? '';
  const ay = Number(raw['開講年度'].replace('年度', '') ?? raw['Academic year']);
  const quarter = parseAcademicQuarter(raw['開講クォーター'] ?? raw['Offered quarter'] ?? '');
  const [titleJa, titleEn] = parsedTitle;

  return {
    code,
    titleJa,
    titleEn,
    ay,
    quarters: quarter,
    periods,
    __raw__: raw
  };

};

const reQuarterPrefix = /^([\d\-~～－]+Q)[:：]\s*/;

export const getEwsParsedData = (raw?: EwsRawData): [CourseInfoScheme[], Record<string, [string, string]>] => {
  const { dataByCalendar, dataByCourse, timeTable } = raw ?? getEwsRawData();
  const parsedData: CourseInfoScheme[] = [];

  // table data
  for (const raw of dataByCourse) {
    parsedData.push({
      __raw__: raw,
      code: raw['科目コード'] ?? raw['Course number'] ?? '',
      titleJa: raw['授業科目名'] ?? '',
      titleEn: raw['Course Title'] ?? '',
      ay: -1,
      quarters: parseAcademicQuarter(raw['Q'] ?? ''),
      periods: parseDayPeriod(raw['曜日・時限'] ?? raw['Class Days/Periods'] ?? ''),
    });
  }

  // calendar data
  const locationMap: Record<string, Set<string>> = {};
  const quarterMap: Record<string, Set<string>> = {};
  const courseMap: Record<string, Record<string, string>> = {};

  // filter
  for (const raw of dataByCalendar) {
    const code = raw['ttSinkokuNo'].trim();

    if (!code)
      continue;

    courseMap[code] = { ...courseMap[code] ?? {}, ...raw };
    if (locationMap[code] == undefined)
      locationMap[code] = new Set();
    if (quarterMap[code] == undefined)
      quarterMap[code] = new Set();

    outerLoop: for (const datum of raw['ttYoubi']?.split?.('\n') ?? []) {
      if (!datum)
        continue;
      // merge quarter
      reQuarterPrefix.lastIndex = 0;
      const [quarterRaw, quarter] = reQuarterPrefix.exec(datum) ?? ['', ''];
      if (!quarterRaw)
        continue;
      quarterMap[code].add(quarter);

      // merge period and location
      const location = datum.substring(quarterRaw.length).trim();
      if (!location)
        continue;
      for (const l of locationMap[code]) {
        if (l.startsWith(location))
          continue outerLoop;
      }
      let flag = false;
      for (const l of locationMap[code]) {
        if (l && location.startsWith(l)) {
          locationMap[code].delete(l);
          locationMap[code].add(location);
          flag = true;
          break;
        }
      }
      if (!flag)
        locationMap[code].add(location);
    }
  }

  // merge
  for (const [code, raw] of Object.entries(courseMap)) {
    parsedData.push({
      __raw__: raw,
      code, 
      titleEn: raw['ttKamokuName'],
      titleJa: raw['ttKamokuName'],
      ay: -2,
      periods: parseDayPeriod([...locationMap[code]].join(' ')),
      quarters: [...quarterMap[code]]
        .map(x => parseAcademicQuarter(x))
        .reduce((p, c) => [...p, ...c], []),
    });
  }

  // return
  return [parsedData, timeTable];
};

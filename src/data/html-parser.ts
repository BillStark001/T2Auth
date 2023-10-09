import { parseHtmlTableToObjects } from '@/common/utils';

const SEL_TITLE = '#right-contents div.page-title-area h3';
const SEL_INFO = '#right-contents div.gaiyo-data dl';

const SEL_E_TABLE_COURSE = 'div.tableSet01 table';
const SEL_E_TABLE_CAL = 'div.tableSet03 table';
const SEL_ETC_CELL = '.tdSinkokuCell .tdSinkoku2';
const SEL_ETC_CELL_TIME = '.th02';

export const getOcwRawData = () => {
  const title = document.querySelector<HTMLElement>(SEL_TITLE)?.innerText ?? '';
  const items = [...document.querySelectorAll(SEL_INFO) ?? []].map((dl, i) => {
    const key = dl.querySelector('dt')?.innerText ?? `#${i}`;
    const value = dl.querySelector('dd')?.innerText ?? '';
    return [key, value] as [string, string];
  });
  const ret: Record<string, string> = {};
  ret.__title__ = title;
  for (const [k, v] of items) {
    ret[k] = v;
  }
  return ret;
};

// Educational Web Service

export type EwsRawData = {
  dataByCourse: Record<string, string>[];
  dataByCalendar: Record<string, string>[];
  timeTable: {
      [k: string]: [string, string];
  };
};

type Parser = (elem: HTMLTableCellElement) => string;
const parsers: { [key: string]: Parser } = {
  ['授業科目名']: (e) =>  e.querySelector('a')?.innerText ?? '',
  ['Course number']: (e) =>  e.querySelector('a')?.innerText ?? '',
};

export const getEwsRawData = (): EwsRawData => {
  const dataByCourse: Record<string, string>[] = [];
  document.querySelectorAll(SEL_E_TABLE_COURSE).forEach((t) => {
    dataByCourse.push(...parseHtmlTableToObjects(t as HTMLTableElement, undefined, parsers));
  });

  const calendarTables = [...document.querySelectorAll(SEL_E_TABLE_CAL)] as HTMLTableElement[];
  const dataByCalendar: Record<string, string>[] = [];
  document.querySelectorAll(SEL_ETC_CELL).forEach((c) => {
    const ans: Record<string, string> = {};
    for (const p of c.childNodes) {
      for (const cls of (p as HTMLElement).classList ?? []) {
        if (cls.startsWith('tt')) {
          ans[cls] = (p as HTMLElement).innerText || '';
          break;
        }
      }
    }
    dataByCalendar.push(ans);
  });

  const timeCellsRaw = [...calendarTables[0]?.querySelectorAll(SEL_ETC_CELL_TIME) ?? []]
    .map(x => ((x as HTMLElement).innerText ?? '').split('\n').filter(x => !!x) as [string, string])
    .filter(x => x.length == 2);
  const timeTable = Object.fromEntries(timeCellsRaw.map(([i, t]) => {
    let [ts, te] = t.split(/-~～ー/, 2);
    ts = ts || '00:00';
    te = te || '00:50';
    if (te.length == 4)
      te = '0' + te;
    return [i, [ts, te] as [string, string]];
  })) as Record<string, [string, string]>;

  return {
    dataByCourse,
    dataByCalendar,
    timeTable,
  };

};

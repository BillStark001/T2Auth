const SEL_TITLE = '#right-contents div.page-title-area h3';
const SEL_INFO = '#right-contents div.gaiyo-data dl';

const SEL_E_TABLE_COURSE = 'div.tableSet01 table';
const SEL_E_TABLE_CAL = 'div.tableSet03 table';
const SEL_ETC_CELL = '.tdSinkokuCell .tdSinkoku2';

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

export const getEwsRawData = () => {

};

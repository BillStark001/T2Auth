import { decryptAES, encryptAES, getFingerPrint } from '@/common/utils';

export type LoginInfoScheme = {
  username: string;
  passwd: string;
  table: string;
};

export type EncodedLoginInfoScheme = LoginInfoScheme & {
  fingerprint: string;
};

export const getDefaultLoginInfo = (): EncodedLoginInfoScheme => ({
  username: '', passwd: '', table: '', fingerprint: 'none'
});

export const decryptInfo = (scheme: EncodedLoginInfoScheme, k: string, i: string): [LoginInfoScheme, boolean] => {
  const { username, passwd, table, fingerprint } = scheme;
  const check = getFingerPrint(k, i) == fingerprint;
  try {
    const du = decryptAES(username, k, i);
    const dp = decryptAES(passwd, k, i);
    const dt = decryptAES(table, k, i);
    return [{
      username: du,
      passwd: dp,
      table: dt,
    }, check];
  } catch (e) {
    return [{
      username: '',
      passwd: '',
      table: '',
    }, false];
  }
};

export const encryptInfo = (scheme: LoginInfoScheme, k: string, i: string): EncodedLoginInfoScheme => {
  const { username, passwd, table } = scheme;
  const du = encryptAES(username, k, i);
  const dp = encryptAES(passwd, k, i);
  const dt = encryptAES(table, k, i);
  const fp = getFingerPrint(k, i);
  return {
    fingerprint: fp,
    username: du,
    passwd: dp,
    table: dt,
  };
};

export type OptionsScheme = {
  directLogin: boolean,
  periodStart: [string, string][],
  quarterInterval: { [ay: string]: [string, string][] }, // month, date, month, date
  lang: string,
};

export type StorageOptionsScheme = OptionsScheme & {
  loginInfo: EncodedLoginInfoScheme,
};

export const getCurrentAcademicYear = () => {
  const d = new Date();
  let ay = d.getFullYear();
  if (d.getMonth() < 3)
    ay -= 1;
  return ay;
};

export const getDefaultQuarterInterval = (ay?: number): [string, string][] => {
  ay = ay ?? getCurrentAcademicYear();
  const ayd = ay.toFixed(0).padStart(4, '0');
  const ayp1 = (ay + 1).toFixed(0).padStart(4, '0');
  return [
    [`${ayd}-04-01`, `${ayp1}-04-01`],
    [`${ayd}-04-01`, `${ayd}-06-01`],
    [`${ayd}-06-01`, `${ayd}-08-01`],
    [`${ayd}-10-01`, `${ayd}-12-01`],
    [`${ayd}-12-01`, `${ayp1}-02-01`],
  ];
};

export const getChangedQuarterInterval = (
  data: [string, string][], 
  q: number, 
  i: string, 
  start: boolean) => {
  const ret = data.map(x => [...x] as [string, string]);
  if (q > 4)
    q = (q - 4) * 2 + (start ? -1 : 0);
  ret[q][start ? 0 : 1] = i;
  return ret;
};

export const getDefaultPeriodStart = () => [
  ['00:00', '00:00'],
  ['08:50', '09:40'],
  ['09:40', '10:30'],
  ['10:45', '11:35'],
  ['11:35', '12:25'],
  ['13:30', '14:20'],
  ['14:20', '15:10'],
  ['15:25', '16:15'],
  ['16:15', '17:05'],
  ['17:15', '18:05'],
  ['18:50', '18:55']
] as [string, string][];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDefaultOptions = (): StorageOptionsScheme => ({
  loginInfo: getDefaultLoginInfo(),
  directLogin: false,
  periodStart: getDefaultPeriodStart(),
  // quarterInterval: (() => {
  //   const _ay = ay ?? getCurrentAcademicYear();
  //   return { [_ay]: getDefaultQuarterInterval(_ay) };
  // })(),
  quarterInterval: {}, 
  lang: '',
});
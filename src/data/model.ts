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
  periodLength: number,
  periodStart: number[],
  quarterInterval: { [quarter: string]: [number, number, number, number] }, // month, date, month, date
  lang: string,
};

export type StorageOptionsScheme = OptionsScheme & {
  loginInfo: EncodedLoginInfoScheme,
};



export const getDefaultOptions = (): StorageOptionsScheme => ({
  loginInfo: getDefaultLoginInfo(),
  directLogin: false,
  periodLength: 50 * 60,
  periodStart: [
    0, 
    8 * 60 + 50, 
    9 * 60 + 40,
    10 * 60 + 45,
    11 * 60 + 35,
    13 * 60 + 30,
    14 * 60 + 20,
    15 * 60 + 25,
    16 * 60 + 15,
    17 * 60 + 15,
    18 * 60 + 5,
  ],
  quarterInterval: {},
  lang: '',
});
import { getIdentity } from '@/common/identity';
import { useMessageHandler } from '@/common/message';
import { getFingerPrint, decryptAES, encryptAES } from '@/common/utils';

function decryptInfo(u: string, p: string, t: string, k: string, i: string, f: string): [string, string, string, boolean] {
  const check = getFingerPrint(k, i) == f;
  if (!check) {
    try {
      const du = decryptAES(u, k, i);
      const dp = decryptAES(p, k, i);
      const dt = decryptAES(t, k, i);
      return [du, dp, dt, check];
    } catch (e) {
      return ['', '', String(e), check];
    }
  }
  const du = decryptAES(u, k, i);
  const dp = decryptAES(p, k, i);
  const dt = decryptAES(t, k, i);
  return [du, dp, dt, check];
}

function encryptInfo(u: string, p: string, t: string, k: string, i: string) {
  const du = encryptAES(u, k, i);
  const dp = encryptAES(p, k, i);
  const dt = encryptAES(t, k, i);
  const fp = getFingerPrint(k, i);
  return {
    fingerprint: fp,
    username: du,
    passwd: dp,
    table: dt,
  };
  // return [fp, du, dp, dt];
}

export type LoginInfoScheme = {
  username: string;
  passwd: string;
  table: string;
  directLogin: boolean;
}

export type OptionsScheme = LoginInfoScheme & {
  fingerprint: string;
};

const allOptions: OptionsScheme = {
  username: '',
  passwd: '',
  table: '',
  fingerprint: 'none',
  directLogin: false,
};

const STORAGE = chrome.storage.sync;


export const getInformation = useMessageHandler(async (): Promise<LoginInfoScheme> => {
  const [k, i] = await getIdentity();
  const options = await STORAGE.get(allOptions);
  const dec = decryptInfo(
    options.username,
    options.passwd,
    options.table,
    k,
    i,
    options.fingerprint
  );
  return {
    username: dec[0],
    passwd: dec[1],
    table: dec[2],
    directLogin: options.directLogin,
  };
}, 'getInformation');

export const getInitInfo = () => getInformation().then(
  ({ username, passwd, table, directLogin }) => [directLogin, username, passwd, table] as [boolean, string, string, string]
);

export const setInformation = useMessageHandler(async (optIn: Partial<LoginInfoScheme>) => {
  const [k, i] = await getIdentity();
  const options = await STORAGE.get(allOptions);
  const opt = { ...options, ...optIn } as LoginInfoScheme;
  const enc = encryptInfo(opt.username, opt.passwd, opt.table, k, i);
  STORAGE.set(enc);
  if (optIn.directLogin != undefined) {
    STORAGE.set({ directLogin: optIn.directLogin });
  }
}, 'setInformation');
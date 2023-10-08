import CryptoJS from 'crypto-js';
import { md5 } from 'md5js';
import { Component, Vnode } from 'mithril';

type _NoLifecycle<T> = Omit<T, keyof Component>;
export type VnodeObj<Attrs, State> = Vnode<Attrs, _NoLifecycle<Component<Attrs, State> & State>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VnodeLike = string | undefined | Vnode<any, any> | VnodeLike[];

/**
 * 
 * @param startOrEnd 
 * @param end 
 * @param step 
 * @returns 
 */
export const range = (startOrEnd: number, end?: number, step: number = 1) => {
  if (step === 0) {
    throw new Error('Step cannot be zero');
  }
  let start = startOrEnd;
  if (end == undefined) {
    end = startOrEnd;
    start = 0;
  }

  const result = [];

  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
  } else {
    for (let i = start; i > end; i += step) {
      result.push(i);
    }
  }

  return result;
};

export const querySelectors = <T extends Element>(target: Document, selectors: string[]) => {
  let ans = null;
  for (const s of selectors) {
    ans = target.querySelector<T>(s);
    if (ans) 
      break;
  }
  return ans;
};

export const saveToFile = (blob: Blob | MediaSource, name: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', name);
  a.click();
};

export const loadJson = <T>() => new Promise<T>((res, rej) => {
  const inp = document.createElement('input');
  inp.setAttribute('type', 'file');
  inp.setAttribute('accept', '.json');
  inp.onchange = (e) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) {
      rej(new Error('file is null'));
    }
    const r = new FileReader();
    r.onload = () => {
      try {
        const ans = JSON.parse(r.result as string);
        inp.value = '';
        res(ans as T);
      } catch (e) {
        rej(e);
      }
    };
    r.readAsText(f!);
  };
  inp.click();
});

const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
export const parseTimeInput = (inputValue: string): [number, number, number | undefined] | undefined => {

  timeRegex.lastIndex = 0;
  const match = timeRegex.exec(inputValue);

  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : undefined;

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && (!seconds || (seconds >= 0 && seconds <= 59))) {
      return [hours, minutes, seconds];
    }
  }

  return undefined;
};


export function getFingerPrint(key: string, iv: string) {
  return md5(key + iv, 32);
}

export function encryptAES(word: string, keystr: string, ivstr: string) {
  const key = CryptoJS.enc.Utf8.parse(keystr);
  const iv = CryptoJS.enc.Utf8.parse(ivstr);
  const srcs = CryptoJS.enc.Utf8.parse(JSON.stringify(String(word)));
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString().toUpperCase();
}

export function decryptAES(word: string, keystr: string, ivstr: string) {
  const key = CryptoJS.enc.Utf8.parse(keystr);
  const iv = CryptoJS.enc.Utf8.parse(ivstr);
  const encryptedHexStr = CryptoJS.enc.Hex.parse(String(word));
  const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  const decrypt = CryptoJS.AES.decrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  try {
    decryptedStr = JSON.parse(decryptedStr);
  } catch (e) {
    // do nothing
  }
  return decryptedStr.toString();
}

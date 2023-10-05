const DEFAULT_KEY = 'default.email@tokyotech.auth.kit';
const DEFAULT_IV = '0011451401919810';

export const getIdentity = async (): Promise<[string, string]> => {
  const x = await chrome.identity.getProfileUserInfo({
    accountStatus: chrome.identity.AccountStatus.ANY
  });

  let xem = x.email;
  let xid = x.id;
  if (!xem) xem = DEFAULT_KEY;
  if (!xid) xid = DEFAULT_IV;
  let key = xem;
  let iv = xid;
  while (key.length < 32) key = key + xem;
  key = key.substring(0, 32);
  while (iv.length < 16) iv = iv + xid;
  iv = iv.substring(0, 16);

  return [key, iv];
};

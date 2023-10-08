import { getIdentity } from '@/common/identity';
import { useMessageHandler } from '@/common/message';
import { LoginInfoScheme, OptionsScheme, decryptInfo, encryptInfo, getDefaultOptions } from '@/data/model';

const allOptions = getDefaultOptions();

const STORAGE = chrome.storage.sync;

const _getLoginInfo = async (): Promise<LoginInfoScheme> => {
  const [k, i] = await getIdentity();
  const options = await STORAGE.get({ loginInfo: allOptions.loginInfo });
  const [dec,] = decryptInfo(options.loginInfo ?? {}, k, i);
  return dec;
};

export const getLoginInfo = useMessageHandler(_getLoginInfo, 'getLoginInfo');

export const setLoginInfo = useMessageHandler(async (info: LoginInfoScheme, id?: [string, string]) => {
  const [k, i] = id ?? await getIdentity();
  const enc = encryptInfo(info, k, i);
  await STORAGE.set({ loginInfo: enc });
}, 'setLoginInfo');

const _getOptions = async (): Promise<OptionsScheme> => {
  const options = await STORAGE.get(allOptions);
  delete options.loginInfo;
  return options as OptionsScheme;
};

export const getOptions = useMessageHandler(_getOptions, 'getOptions');

export const setOptions = useMessageHandler(async (optIn: Partial<OptionsScheme>) => {
  await STORAGE.set(optIn);
}, 'setOptions');

export const getAllInfo = useMessageHandler(async () => [
  await _getOptions(),
  await _getLoginInfo(),
] as [OptionsScheme, LoginInfoScheme], 'getAllInfo');


export const getLanguage = () => getOptions().then(o => o?.lang ?? '');
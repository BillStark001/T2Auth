import i18next from 'i18next';
import langRes, { langOrder } from './file';

i18next.init({
  debug: true,
  fallbackLng: 'en',
  resources: Object.fromEntries(
    langOrder.map(x => [x, { translation: langRes[x] }])
  ),
});

export const t = i18next.t;
export const changeLanguage = i18next.changeLanguage;
export const supportedLanguages = langOrder;
export default i18next;

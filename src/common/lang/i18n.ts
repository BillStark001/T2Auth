import i18next from 'i18next';
import langRes, { langOrder } from './file';
import LanguageDetector from 'i18next-browser-languagedetector';

i18next
  .use(LanguageDetector)
  .init({
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

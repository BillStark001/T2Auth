import i18next from 'i18next';
import langRes, { langOrder } from './file';

i18next.init({
  lng: 'en',
  debug: true,
  resources: Object.fromEntries(
    langOrder.map(x => [x, { translation: langRes[x] }])
  ),
});
console.log(Object.fromEntries(
  langOrder.map(x => [x, { translation: langRes[x] }])
));
export const t = i18next.t;
export default i18next;
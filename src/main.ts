
import { tryConnect } from './common/message';
import { mountOnEwsPage } from './mixin/ews';
import { proceedLogin } from './mixin/login';
import { mountOnOcwPage } from './mixin/ocw';
import { autoSetLanguage } from './view';

// console.log('Thanks for using the Authentication Kit.');

const main = async () => {
  await tryConnect();
  await autoSetLanguage();
  const host = location.hostname;
  if (host.includes('ocw')) {
    mountOnOcwPage();
  } else if (host.includes('kyomu') || host.includes('gakumu')) {
    mountOnEwsPage();
  } else {
    proceedLogin();
  }
};

main().catch(console.error);

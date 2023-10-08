
import { tryConnect } from './common/message';
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
  } else {
    proceedLogin();
  }
};

main().catch(console.error);


import { tryConnect } from './common/message';
import { proceedLogin } from './mixin/login';
import { mountOnOcwPage, mountOnEwsPage } from './mixin/cal-gen';
import { autoSetLanguage } from './view';

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

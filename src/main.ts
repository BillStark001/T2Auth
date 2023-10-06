
import { tryConnect } from './common/message';
import { proceedLogin } from './mixin/login';
import { mountOnOcwPage } from './mixin/ocw';
import { getInitInfo } from './page/sw';

// console.log('Thanks for using the Authentication Kit.');

const main = async () => {
  await tryConnect();
  const host = location.hostname;
  if (host.includes('ocw')) {
    mountOnOcwPage();
  } else {
    proceedLogin(await getInitInfo());
  }
};

main().catch(console.error);

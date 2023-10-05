import { tryConnect } from './common/message';
import { proceedLogin } from './pages/login';
import { getInitInfo } from './pages/sw';

console.log('Thanks for using the Authentication Kit.');

const main = async () => {
  await tryConnect();
  const i = await getInitInfo();
  proceedLogin(i);
};

main().catch(console.error);

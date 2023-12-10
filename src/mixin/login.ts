import { t } from '@/common/lang';
import { querySelectors } from '@/common/utils';
import { getAllInfo } from '@/page/sw';

// patterns
const SEL_AUTH = [
  'input[type="button"][value="同意（マトリクス/OTP認証）"]',
  'input[type="button"][value="Agree(Matrix|OTP Auth.)"]',
  'input[type="button"][value="同意（マトリクス/OTP/ソフトトークン認証）"]',
  'input[type="button"][value="Agree ( Matrix / OTP / Soft Token Auth.)"]',
];

const SEL_ACCOUNT = 'input[type="text"][name="usr_name"]';
const SEL_PASSWD = 'input[type="password"][name="usr_password"]';
const SEL_FORWARD = 'input[type="submit"][name="OK"]';

const SEL_LOGOUT = 'a[href="/GetAccess/Logout"]';

// vars

let btnAuth: HTMLInputElement | null = null,
  textAccount: HTMLInputElement | null = null,
  textPasswd: HTMLInputElement | null = null,
  btnForward: HTMLInputElement | null = null,
  formAuth: HTMLTableElement | null = null,
  btnLogout: HTMLInputElement | null = null;

let inScreen1 = false,
  inScreen2 = false,
  inScreen3 = false,
  inScreen4 = false;

const inAtLeastOneScreen = () => inScreen1 || inScreen2 || inScreen3 || inScreen4;

const showAlert = (ctx: string) => {
  alert(ctx);
};

const showInfo = (ctx: string) => {
  console.log(ctx);
};

// different screens

function procScreen1(directLogin?: boolean) {
  showInfo('Screen 1');
  if (directLogin) 
    btnAuth!.click();
  else {
    const loginHint = document.createElement('span');
    loginHint.classList.add('titleLogo');
    loginHint.innerText = t('mixin.login.hint');
    const parent = btnAuth?.parentNode;
    parent?.appendChild(document.createElement('br'));
    parent?.appendChild(loginHint);
  }
}

function procScreen2(username: string, passwd: string) {
  // get username
  // get password
  showInfo('Screen 2');
  if (!username || !passwd) {
    showAlert(
      'Invalid username or password. Please check options page.'
    );
  } else {
    textAccount!.value = username;
    textPasswd!.value = passwd;
    btnForward!.click();
  }
}

const reMatrixCodePos = /\[\s*([A-Z])\s*,\s*([0-9])\s*\]/g;
const A_CHAR_CODE = 'A'.charCodeAt(0);
const NUM_1_CHAR_CODE = '1'.charCodeAt(0);

function procScreen3(table: string) {
  showInfo('Screen 3');
  const auth = formAuth as HTMLTableElement;
  // get table
  if (
    !table ||
    String(table).startsWith('0000000000') ||
    String(table).toUpperCase().startsWith('UNDEFINED')
  ) {
    showAlert(
      'Invalid matrix information. Please check options page.'
    );
  } else {
    let validInput = 0;
    auth.querySelectorAll<HTMLInputElement>('input[type=password]').forEach((el) => {
      const codeTarget = el.parentElement?.parentElement?.querySelector('th[align=left]')?.textContent;
      if (!codeTarget)
        return;
      reMatrixCodePos.lastIndex = 0;
      const execRes = reMatrixCodePos.exec(codeTarget);
      if (!execRes)
        return;
      // code position
      const pos = execRes[1].charCodeAt(0) - A_CHAR_CODE + 
        (execRes[2].charCodeAt(0) - NUM_1_CHAR_CODE) * 10;
      el.value = table[pos];
      ++validInput;
    });
    if (validInput != 3) {
      showAlert(`Matrix authentication info count incorrect. \nExpected 3, got ${validInput}.`);
    } else {
      btnForward!.click();
    }
  }
}

// main()

export const proceedLogin = async () => {

  const [{ directLogin }, { username, passwd, table }] = await getAllInfo();

  let handle: NodeJS.Timeout | undefined = undefined;

  handle = setInterval(() => {
    btnAuth = querySelectors(document, SEL_AUTH) as HTMLInputElement;
    inScreen1 = !!btnAuth;

    textAccount = document.querySelector(SEL_ACCOUNT);
    textPasswd = document.querySelector(SEL_PASSWD);
    btnForward = document.querySelector(SEL_FORWARD);
    inScreen2 = !!(textAccount && textPasswd && btnForward);

    formAuth = document.getElementById('authentication') as HTMLTableElement;
    inScreen3 = !!(formAuth && btnForward);

    btnLogout = document.querySelector(SEL_LOGOUT);
    inScreen4 = !!btnLogout;

    if (inAtLeastOneScreen()) {
      clearInterval(handle);
      handle = undefined;
      if (inScreen1) procScreen1(directLogin);
      if (inScreen2) procScreen2(username, passwd);
      if (inScreen3) procScreen3(table);
      if (inScreen4) showInfo('Logged In!');
    }
  }, 300);
};
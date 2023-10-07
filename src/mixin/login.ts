import { t } from '@/common/lang/i18n';
import { querySelectors } from '@/common/utils';
import { getAllInfo } from '@/page/sw';

// patterns
const SEL_AUTH = [
  'input[type="button"][value="同意（マトリクス/OTP認証）"]',
  'input[type="button"][value="Agree(Matrix|OTP Auth.)"]',
  'input[type="button"][value="同意（マトリクス/OTP/ソフトトークン認証）"]',
  'input[type="button"][value="Agree ( Matrix / OTP / Soft Token Auth.)"]',
];

const SEL_ACCOUNT = 'input.form-control[type="text"][name="usr_name"]';
const SEL_PASSWD = 'input.form-control[type="password"][name="usr_password"]';
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
    for (let i = 3; i < 6; ++i) {
      const a0 = auth.rows[i].cells[0].textContent;
      if (!a0) {
        showAlert(`Failed to get matrix authentication at position ${i}.`);
        continue;
      }
      const pos =
        a0.charCodeAt(1) - 'A'.charCodeAt(0) +
        (a0.charCodeAt(3) - '1'.charCodeAt(0)) * 10;
      const a2 = auth.rows[i].cells[2];
      (a2.children[0].children[0].children[1] as HTMLInputElement).value = table[pos];
    }
    btnForward!.click();
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
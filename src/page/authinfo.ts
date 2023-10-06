import { Button } from '@/view/general';
import m, { ComponentTypes as C } from 'mithril';
import { LoginInfoScheme, getInformation, getInitInfo, setInformation } from './sw';
import { VnodeObj, loadJson, saveToFile } from '@/common/utils';

const MATRIX_ROWS = 7;
const MATRIX_COLS = 10;

const legalizeMatrixRow = (strRaw: string | undefined) => {
  return ((strRaw || '').replace(/\s/g, '') + new Array(MATRIX_COLS).join('0'))
    .substring(0, MATRIX_COLS)
    .toUpperCase();
};

const checkAndFormInfo = (acc: string, pwd: string, codes: string[]): [
  boolean, string, Partial<LoginInfoScheme>
] => {
  let vt = true;
  let alerts = '';
  if (acc.length == 0) {
    vt = false;
    alerts += 'Please input your account!\n';
  }
  if (pwd.length == 0) {
    vt = false;
    alerts += 'Please input your password!\n';
  }
  let mat = '';
  for (let i = 0; i < MATRIX_ROWS; ++i) {
    let vt1 = true;
    const tmat = legalizeMatrixRow(codes[i]);
    if (tmat.indexOf('0') >= 0) {
      vt1 = false;
    } else {
      for (let j = 0; j < MATRIX_COLS; ++j)
        if (
          tmat.charCodeAt(i) > 'Z'.charCodeAt(0) ||
          tmat.charCodeAt(i) < 'A'.charCodeAt(0)
        )
          vt1 = false;
    }
    mat = mat + tmat;
    if (vt1 != true) {
      vt = false;
      alerts += 'Invalid data at matrix info line ' + i + '!\n';
    }
  }
  return [
    vt,
    alerts,
    {
      username: acc,
      passwd: pwd,
      table: mat,
    },
  ];
};

const MatrixInfo: C<{
  rows: string[],
  oninput: (i: number, v: string) => void,
}> = {
  view(vnode) {
    const matrixRows = [];
    const { rows, oninput: oi } = vnode.attrs;
    for (let i = 0; i < MATRIX_ROWS; i++) {
      matrixRows.push(
        m('input.form-control.mat-input', {
          type: 'text',
          size: '32',
          maxlength: '255',
          placeholder: `Row ${i}`,
          value: rows[i],
          oninput(e: InputEvent) {
            oi(i, ((e.target as HTMLInputElement).value ?? '')
              .substring(0, MATRIX_COLS));
          }
        })
      );
    }
    return m('div.col-sm-7', matrixRows);
  }
};

type _S = {
  account: string,
  password: string,
  matrixCodes: string[],
  valid: Record<string, boolean>,
  directLogin: boolean,
};

const refresh = async (vnode: VnodeObj<object, _S>) => {
  const [directLogin, account, password, matrixInfo] = await getInitInfo();
  const matrixCodes = [];
  for (let i = 0; i < MATRIX_ROWS; ++i) {
    matrixCodes.push(legalizeMatrixRow(
      matrixInfo.substring(i * MATRIX_COLS, i * MATRIX_COLS + MATRIX_COLS))
    );
  }
  Object.assign(vnode.state, {
    account, password, directLogin, matrixCodes, valid: {
      account: !!account,
      password: !!password,
    }
  });
  m.redraw();
};

export const AuthInfoOptions: C<object, _S> = {
  async oninit(vnode) {
    refresh(vnode);
  },

  view(vnode) {
    return m('div.options', [
      m('div', 'Please input your account, password & matrix authentication information.'),
      m('div.separator'),
      m('div.option-group', [
        m('div.option-key', 'Account\n(Student No.)'),
        m('input.form-control', {
          type: 'text',
          size: '32',
          maxlength: '255',
          placeholder: 'Account',
          value: vnode.state.account,
          oninput(e: InputEvent) {
            vnode.state.account = (e.target as HTMLInputElement).value;
          }
        })
      ]),
      m('div.option-group', [
        m('div.option-key', 'Password'),
        m('input.form-control', {
          type: 'password',
          size: '32',
          maxlength: '32',
          placeholder: 'Password',
          value: vnode.state.password,
          oninput(e: InputEvent) {
            vnode.state.password = (e.target as HTMLInputElement).value;
          }
        })
      ]),
      m('div.separator'),
      m('div.option-group', [
        m('div.option-key', 'Matrix Info.'),
        m(MatrixInfo, {
          rows: vnode.state.matrixCodes ?? [],
          oninput(i, v) {
            vnode.state.matrixCodes[i] = v;
          }
        })
      ]),
      m('div.separator'),
        
      m('div[align=center]', [
        m('input[type=checkbox][name=direct-login][value=direct-login]', {
          checked: vnode.state.directLogin,
          onchange(e: InputEvent) {
            vnode.state.directLogin = (e.target as HTMLInputElement).checked;
          }
        }),
        m('label[for=direct-login]', 'Log in automatically once a login page is opened')
      ]),
      m('div.separator'),
        
      
      m('div.btn-group[align=center]', [
        m(Button, {
          text: 'Submit', click() {
            const [vt, alerts, payload] = checkAndFormInfo(
              vnode.state.account, vnode.state.password, vnode.state.matrixCodes
            );
            if (!vt) {
              alert(alerts);
            } else {
              setInformation({ ...payload, directLogin: vnode.state.directLogin, }).then(() => refresh(vnode));
            }
          },
        }),
        m(Button, {
          text: 'Delete All Stored Information', click() {
            const [, , payload] = checkAndFormInfo('', '', []);
            setInformation({ ...payload, directLogin: false, }).then(() => refresh(vnode));
          },
        }),
      ]),

      m('div.btn-group[align=center]', [
        m(Button, {
          text: 'Input From File', click() {
            loadJson<Partial<LoginInfoScheme>>().then(async (ans) => {
              await setInformation(ans);
              await refresh(vnode);
            });
          },
        }),
        m(Button, {
          text: 'Output To File', click() {
            getInformation().then(rawContent => {
              const content = JSON.stringify(rawContent);
              console.log(content);
              const blob = new Blob([content], {
                type: 'text/plain;charset=utf-8',
              });
              saveToFile(blob, 'options.json');
            });
          },
        }),
      ]),
      
    ]);
  }
};


import { Button } from '@/view/general';
import m, { ComponentTypes as C } from 'mithril';
import { getAllInfo, setLoginInfo, getLoginInfo } from './sw';
import { VnodeObj, loadJson, saveToFile } from '@/common/utils';
import { LoginInfoScheme, getDefaultLoginInfo } from '@/data/model';
import { t } from '@/common/lang/i18n';

const MATRIX_ROWS = 7;
const MATRIX_COLS = 10;

const legalizeMatrixRow = (strRaw: string | undefined) => {
  return ((strRaw || '').replace(/\s/g, '') + new Array(MATRIX_COLS).join('0'))
    .substring(0, MATRIX_COLS)
    .toUpperCase();
};

const checkAndFormInfo = (acc: string, pwd: string, codes: string[]): [
  boolean, string, LoginInfoScheme
] => {
  let vt = true;
  const alerts: string[] = [];
  if (acc.length == 0) {
    vt = false;
    alerts.push(t('page.options.alert.noUser'));
  }
  if (pwd.length == 0) {
    vt = false;
    alerts.push(t('page.options.alert.noPassword'));
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
      alerts.push(t('page.options.alert.invalidMat', { line: i + 1 }));
    }
  }
  return [
    vt,
    alerts.join('\n'),
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
          maxlength: String(MATRIX_COLS),
          placeholder: t('page.options.loginInfo.table.placeholder', { row: i + 1 }),
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
};

const refresh = async (vnode: VnodeObj<object, _S>) => {
  const [{ directLogin }, { username: account, passwd: password, table: matrixInfo }] = await getAllInfo();
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

export const LoginInfoPanel: C<object, _S> = {
  async oninit(vnode) {
    refresh(vnode);
  },

  view(vnode) {
    return m('div.options', [
      m('div.option-group', [
        m('div.option-key', t('page.options.loginInfo.username.key')),
        m('input.form-control', {
          type: 'text',
          size: '32',
          maxlength: '255',
          placeholder: t('page.options.loginInfo.username.placeholder'),
          value: vnode.state.account,
          oninput(e: InputEvent) {
            vnode.state.account = (e.target as HTMLInputElement).value;
          }
        })
      ]),
      m('div.option-group', [
        m('div.option-key', t('page.options.loginInfo.passwd.key')),
        m('input.form-control', {
          type: 'password',
          size: '32',
          maxlength: '32',
          placeholder: t('page.options.loginInfo.passwd.placeholder'),
          value: vnode.state.password,
          oninput(e: InputEvent) {
            vnode.state.password = (e.target as HTMLInputElement).value;
          }
        })
      ]),
      m('div.separator'),
      m('div.option-group', [
        m('div.option-key', t('page.options.loginInfo.table.key')),
        m(MatrixInfo, {
          rows: vnode.state.matrixCodes ?? [],
          oninput(i, v) {
            vnode.state.matrixCodes[i] = v;
          }
        })
      ]),
      m('div.separator'),
        
      
      m('div.btn-group[align=center]', [
        m(Button, {
          text: t('page.options.btn.submit'), async click() {
            const [vt, alerts, payload] = checkAndFormInfo(
              vnode.state.account, vnode.state.password, vnode.state.matrixCodes
            );
            if (!vt) {
              alert(alerts);
            } else {
              await setLoginInfo(payload);
              refresh(vnode);
            }
          },
        }),
        m(Button, {
          text: t('page.options.btn.delete'), click() {
            const [, , payload] = checkAndFormInfo('', '', []);
            setLoginInfo(payload).then(() => refresh(vnode));
          },
        }),
        m(Button, {
          text: t('page.options.btn.input'), click() {
            loadJson<Partial<LoginInfoScheme>>().then(async (ans) => {
              await setLoginInfo({ ...getDefaultLoginInfo(), ...ans });
              await refresh(vnode);
            });
          },
        }),
        m(Button, {
          text: t('page.options.btn.output'), click() {
            getLoginInfo().then((rawContent) => {
              const content = JSON.stringify(rawContent);
              const blob = new Blob([content], {
                type: 'text/plain;charset=utf-8',
              });
              saveToFile(blob, 'account.json');
            });
          },
        }),
      ]),
      
    ]);
  }
};


import { Button } from '@/view';
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
    alerts.push(t('page.loginInfo.alert.noUser'));
  }
  if (pwd.length == 0) {
    vt = false;
    alerts.push(t('page.loginInfo.alert.noPassword'));
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
          tmat.charCodeAt(j) > 'Z'.charCodeAt(0) ||
          tmat.charCodeAt(j) < 'A'.charCodeAt(0)
        )
          vt1 = false;
    }
    mat = mat + tmat;
    if (vt1 != true) {
      vt = false;
      alerts.push(t('page.loginInfo.alert.invalidMat', { line: i + 1 }));
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
        m('input', {
          type: 'text',
          size: '32',
          maxlength: String(MATRIX_COLS),
          placeholder: t('page.loginInfo.table.placeholder', { row: i + 1 }),
          value: rows[i],
          oninput(e: InputEvent) {
            oi(i, ((e.target as HTMLInputElement).value ?? '')
              .substring(0, MATRIX_COLS));
          }
        })
      );
    }
    return m('fieldset.pure-group[align=center].mat-input', matrixRows);
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

const _v = <T>(state: T, key: keyof T) => ({
  value: state[key],
  oninput(e: InputEvent) {
    state[key] = (e.target as HTMLInputElement).value as T[keyof T];
  }
});

export const LoginInfoPanel: C<object, _S> = {
  async oninit(vnode) {
    refresh(vnode);
  },

  view(vnode) {
    return m('form.options.pure-form.pure-form-aligned', [

      m('h2.content-subhead', t('page.loginInfo.section.basic')),

      m('div.pure-control-group', [
        m('label', t('page.loginInfo.username.key')),
        m('input', {
          type: 'text',
          maxlength: '255',
          placeholder: t('page.loginInfo.username.placeholder'),
          ..._v(vnode.state, 'account'),
        }),
      ]),
      m('div.pure-control-group', [
        m('label', t('page.loginInfo.passwd.key')),
        m('input', {
          type: 'password',
          maxlength: '32',
          placeholder: t('page.loginInfo.passwd.placeholder'),
          ..._v(vnode.state, 'password'),
        })
      ]),
        
      m('h2.content-subhead', t('page.loginInfo.section.table')),
      m(MatrixInfo, {
        rows: vnode.state.matrixCodes ?? [],
        oninput(i, v) {
          vnode.state.matrixCodes[i] = v;
        }
      }),
      
      m('div.btn-group', [
        m(Button, {
          text: t('page.options.btn.submit'), async click(e: Event) {
            e.preventDefault();
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
          text: t('page.options.btn.delete'), async click(e: Event) {
            e.preventDefault();
            const [, , payload] = checkAndFormInfo('', '', []);
            await setLoginInfo(payload);
            refresh(vnode);
          },
        }),
        m(Button, {
          text: t('page.options.btn.input'), async click(e: Event) {
            e.preventDefault();
            const ans = await loadJson<Partial<LoginInfoScheme>>();
            await setLoginInfo({ ...getDefaultLoginInfo(), ...ans });
            await refresh(vnode);
          },
        }),
        m(Button, {
          text: t('page.options.btn.output'), async click(e: Event) {
            e.preventDefault();
            const rawContent = await getLoginInfo();
            const content = JSON.stringify(rawContent);
            const blob = new Blob([content], {
              type: 'text/plain;charset=utf-8',
            });
            saveToFile(blob, 'account.json');
          },
        }),
      ]),
      
    ]);
  }
};


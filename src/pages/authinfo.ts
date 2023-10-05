import { Button } from '../common/controls';
import m from 'mithril';
import { ComponentTypes as C } from 'mithril';
import { LoginInfoScheme, getInformation, getInitInfo, setInformation } from './sw';
import { loadJson, saveToFile } from '../common/utils';

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

export const AuthInfoOptions: C<object, {
  account: string,
  password: string,
  matrixCodes: string[],
  valid: Record<string, boolean>,
  directLogin: boolean,
  refresh: () => Promise<void>
}> = {
  async oninit(vnode) {
    const refresh = async () => {
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
    vnode.state.refresh = refresh;
    refresh();
  },

  view(vnode) {
    return m('div.std-border', [
      m('table.options', [
        m('tbody', [
          m('tr', [
            m('td[colspan=2]', 'Please input your account, password & matrix authentication information.'),
            m('div.separator')
          ]),
          m('tr', [
            m('th[align=left]', 'Account\n(Student No.)'),
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
          m('tr', [
            m('th[align=left]', 'Password'),
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
          m('tr', [
            m('td[colspan=2]', m('div.separator'))
          ]),
          m('tr', [
            m('th[align=left]', 'Matrix Info.'),
            m(MatrixInfo, {
              rows: vnode.state.matrixCodes ?? [],
              oninput(i, v) {
                vnode.state.matrixCodes[i] = v;
              }
            })
          ]),
          m('tr', [
            m('td[colspan=2]', m('div.separator'))
          ]),
          m('tr', [
            m('td.btn-group[align=center][colspan=2]', [
              m(Button, {
                text: 'Submit', click() {
                  const [vt, alerts, payload] = checkAndFormInfo(
                    vnode.state.account, vnode.state.password, vnode.state.matrixCodes
                  );
                  if (!vt) {
                    alert(alerts);
                  } else {
                    setInformation({ ...payload, directLogin: vnode.state.directLogin, }).then(vnode.state.refresh);
                  }
                },
              }),
              m(Button, {
                text: 'Delete All Stored Information', click() {
                  const [, , payload] = checkAndFormInfo('', '', []);
                  setInformation({ ...payload, directLogin: false, }).then(vnode.state.refresh);
                },
              }),
            ])
          ]),
          m('tr', [
            m('td[align=center][colspan=2]', [
              m('input[type=checkbox][id=direct-login][name=direct-login][value=direct-login]', {
                checked: vnode.state.directLogin,
                onchange(e: InputEvent) {
                  vnode.state.directLogin = (e.target as HTMLInputElement).checked;
                }
              }),
              m('label[for=direct-login]', 'Log in automatically once a login page is opened')
            ])
          ]),
          m('tr', [
            m('td.btn-group[align=center][colspan=2]', [
              m(Button, {
                text: 'Input From File', click() {
                  loadJson<Partial<LoginInfoScheme>>().then(async (ans) => {
                    await setInformation(ans);
                    await vnode.state.refresh();
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
            ])
          ])
        ])
      ])
    ]);
  }
};


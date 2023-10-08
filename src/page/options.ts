import { OptionsScheme, StorageOptionsScheme, getDefaultOptions } from '@/data/model';
import m, { ComponentTypes as C } from 'mithril';
import { getOptions, setOptions } from './sw';
import { supportedLanguages, t } from '@/common/lang/i18n';
import { Button } from '@/view';
import { VnodeObj, loadJson, saveToFile } from '@/common/utils';


type _S = {
  options: OptionsScheme & Partial<StorageOptionsScheme>,
}

const refresh = async (vnode: VnodeObj<object, _S>) => {
  const options = await getOptions();
  vnode.state.options = options;
  m.redraw();
};

export const OptionsPanel: C<object, _S> = {
  oninit(vnode) {
    vnode.state.options = getDefaultOptions();
    delete vnode.state.options.loginInfo;
    refresh(vnode);
  },

  view(vnode) {
    const { options } = vnode.state;
    return m('form.options.pure-form.pure-form-aligned', [

      m('fieldset', [
        m('div.pure-control-group', [
          m('label', t('page.loginInfo.username.key')),
          m('div.pure-g.pure-group', { style: { width: '150px', display: 'inline-block' } }, [
            m('input.pure-u-1', {
              type: 'time'
            }), m('input.pure-u-1', {
              type: 'time'
            }), m('input.pure-u-1', {
              type: 'time'
            }), m('input.pure-u-1', {
              type: 'time'
            }), m('input.pure-u-1', {
              type: 'time'
            }),
          ]),m('div.pure-g.pure-group', { style: { width: '150px', display: 'inline-block' } }, [
            m('input.pure-u-1', {
              type: 'time'
            }), m('input.pure-u-1', {
              type: 'time'
            }), m('input.pure-u-1', {
              type: 'time'
            }), m('input.pure-u-1', {
              type: 'time'
            }), m('input.pure-u-1', {
              type: 'time'
            }),
          ]),

          m('div.pure-control-group', [
            m('label', t('page.loginInfo.username.key')),
            m('input', {
              type: 'date',
            })
          ]),
          m('div.pure-control-group', [
            m('label', t('page.options.lang.key')),
            m('select', supportedLanguages.map(l => m('option', t('page.options.lang.value.' + l))))
          ])

        ]),

      ]),

      m('div.separator'),

      m('div[align=center]', [
        m('input[type=checkbox][name=direct-login][value=direct-login]', {
          checked: options.directLogin,
          onchange(e: InputEvent) {
            options.directLogin = (e.target as HTMLInputElement).checked;
          }
        }),
        m('label[for=direct-login]', t('page.options.directLogin'))
      ]),

      m('div.separator'),

      m('div.btn-group[align=center]', [
        m(Button, {
          text: t('page.options.btn.submit'), async click() {
            await setOptions(options);
            await refresh(vnode);
          },
        }),
        m(Button, {
          text: t('page.options.btn.restore'), click() {
            const def: OptionsScheme = getDefaultOptions();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (def as any).loginInfo;
            setOptions(def)
              .then(() => refresh(vnode));
          },
        }),
        m(Button, {
          text: t('page.options.btn.input'), async click() {
            const ans = await loadJson<Partial<OptionsScheme>>();
            await setOptions(ans);
            await refresh(vnode);
          },
        }),
        m(Button, {
          text: t('page.options.btn.output'), async click() {
            const rawContent = getOptions();
            const content = JSON.stringify(rawContent);
            console.log(content);
            const blob = new Blob([content], {
              type: 'text/plain;charset=utf-8',
            });
            saveToFile(blob, 'options.json');
          },
        }),
      ]),

    ]);
  },
};
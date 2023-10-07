import { OptionsScheme, StorageOptionsScheme, getDefaultOptions } from '@/data/model';
import m, { ComponentTypes as C } from 'mithril';
import { getOptions, setOptions } from './sw';
import { t } from '@/common/lang/i18n';
import { Button } from '@/view/general';
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
    return m('div.options', [

      m('div[align=center]', [
        m('input[type=checkbox][name=direct-login][value=direct-login]', {
          checked: options.directLogin,
          onchange(e: InputEvent) {
            options.directLogin = (e.target as HTMLInputElement).checked;
          }
        }),
        m('label[for=direct-login]', t('page.options.directLogin'))
      ]),

      // TODO


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
import { OptionsScheme, StorageOptionsScheme, getDefaultOptions } from '@/data/model';
import m, { ComponentTypes as C } from 'mithril';
import { getOptions, setOptions } from './sw';
import { supportedLanguages, t } from '@/common/lang/i18n';
import { Button, autoSetLanguage } from '@/view';
import { VnodeObj, getBoundData, loadJson, range, saveToFile } from '@/common/utils';


type _S = {
  options: OptionsScheme & Partial<StorageOptionsScheme>,
}

const refresh = async (vnode: VnodeObj<object, _S>) => {
  const options = await getOptions();
  vnode.state.options = options;
  await autoSetLanguage();
  m.redraw();
};

const periods = range(1, 11);

export const OptionsPanel: C<object, _S> = {
  oninit(vnode) {
    vnode.state.options = getDefaultOptions();
    delete vnode.state.options.loginInfo;
    refresh(vnode);
  },

  view(vnode) {
    const { options } = vnode.state;
    return m('form.options.pure-form.pure-form-aligned', [

      m('h2.content-subhead', t('page.options.section.basic')),
      m('div.pure-control-group', [
        m('label', t('page.options.lang.key')),
        m('select', 
          getBoundData(options, 'lang'),
          m('option', { value: '' }, t('page.options.lang.value.__null__')),
          supportedLanguages.map(l => m('option', { value: l }, t('page.options.lang.value.' + l))))
      ]),
      m('div.pure-control-group', [
        m('label', t('page.options.directLogin.key')),
        m('span', [
          m('input[type=checkbox][name=direct-login]', getBoundData(options, 'directLogin', true)),
          m('label[for=direct-login]', { style: { width: 'max-content', 'margin-left': '5px' }, }, t('page.options.directLogin.value'))
        ])
      ]),

      
      m('h2.content-subhead', t('page.options.section.period')),
      m('fieldset', periods.map((p) => m('div.pure-control-group', [
        m('label', t('page.options.period.sub', { period: p })),
        m('span', [
          m('input[type=time]', getBoundData(options.periodStart[p], 0)),
          '-',
          m('input[type=time]', getBoundData(options.periodStart[p], 1)),
        ])
      ]))),
      
      // m('h2.content-subhead', t('page.options.section.quarter')),

      // m('div.pure-control-group', [
      //   m('label', t('page.loginInfo.username.key')),
      //   m('input', {
      //     type: 'date',
      //   })
      // ]),


      m('div.btn-group', [
        m(Button, {
          text: t('page.options.btn.submit'), async click(e: Event) {
            e.preventDefault();
            await setOptions(options);
            await refresh(vnode);
          },
        }),
        m(Button, {
          text: t('page.options.btn.restore'), click(e: Event) {
            e.preventDefault();
            const def: OptionsScheme = getDefaultOptions();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (def as any).loginInfo;
            setOptions(def)
              .then(() => refresh(vnode));
          },
        }),
        m(Button, {
          text: t('page.options.btn.input'), async click(e: Event) {
            e.preventDefault();
            const ans = await loadJson<Partial<OptionsScheme>>();
            await setOptions(ans);
            await refresh(vnode);
          },
        }),
        m(Button, {
          text: t('page.options.btn.output'), async click(e: Event) {
            e.preventDefault();
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
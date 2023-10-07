import { LanguageResource, compileLanguageResource } from './model';

export const langOrder = Object.freeze(['en', 'ja', 'zh']);

export const langRes: LanguageResource = {
  meta: {
    app: {
      name: 'T2Auth',
      author: 'Bill Stark',
      footer: 'Made by {{author}}',
    },
    weekDay: {
      [0]: ['Sunday', '日曜日', '星期日'],
      [1]: ['Monday', '月曜日', '星期一'],
      [2]: ['Tuesday', '火曜日', '星期二'],
      [3]: ['Wednesday', '水曜日', '星期三'],
      [4]: ['Thursday', '木曜日', '星期四'],
      [5]: ['Friday', '金曜日', '星期五'], 
      [6]: ['Saturday', '土曜日', '星期六'],
      brief: {
        [0]: ['Sun', '日', '日'],
        [1]: ['Mon', '月', '一'],
        [2]: ['Tue', '火', '二'],
        [3]: ['Wed', '水', '三'],
        [4]: ['Thr', '木', '四'],
        [5]: ['Fri', '金', '五'], 
        [6]: ['Sat', '土', '六']
      }
    },
    quarter: {
      [1]: '1Q',
      [2]: '2Q',
      [3]: '3Q',
      [4]: '4Q',
      [5]: ['1st Semester', '前学期', '第一学期'],
      [6]: ['2nd Semester', '後学期', '第二学期'],
    },
    date: {
      md: ['MMM D', 'M月D日', 'M月D日'],
    }
  },
  mixin: {
    login: {
      hint: [
        'T2Auth: Auto Login Ready.',
        'T2Auth: 自動ログイン可能です。',
        'T2Auth: 自动登录已启用。',
      ]
    },
    ocw: {
      cal: {
        start: ['Start→', '学期開始→', '学期开始→'],
        end: ['End→', '学期終了→', '学期结束→'],
        jump: ['Cancel', '飛ばす', '跳过本次'],
        noJump: ['Restore', '戻す', '恢复'],

        title: [
          'Calendar of AY {{year}}, {{quarter}}',
          '{{year}}年度 {{quarter}}',
          '{{year}}年度 {{quarter}}',
        ],
        weekIndex: [
          'Week {{index}}',
          '第{{index}}週',
          '第{{index}}周',
        ],
        weekRange: '{{start}} - {{end}}',
        weekOut: [
          'Outside',
          '授業外',
          '学期外'
        ]

      },
      calGen: [
        'Generate iCalendar File',
        'iCalendarファイルを生成',
        '生成iCalendar日程文件',
      ]

    }
  },
  page: {
    options: {
      btn: {
        'submit': ['Submit', '保存', '保存'],
        'restore': ['Restore to Default', 'デフォルトに設定', '设为默认'],
        'delete': ['Delete', '削除', '删除'],
        'input': ['Upload', 'アップロード', '上传并替换'],
        'output': ['Download', 'ダウンロード', '下载'],
      },
      alert: {
        noUser: [
          'Please input your account!', 
          'アカウントをご入力ください。',
          '请输入账户！',
        ],
        noPassword: [
          'Please input your password!', 
          'パスワードをご入力ください。',
          '请输入密码！',
        ],
        invalidMat: [
          'Invalid data at matrix info line {{line}}!',
          'マトリクスコード第 {{line}} 行目にエラーがあります。',
          '在矩阵信息第 {{line}} 行发现错误。',
        ]
      },
      loginInfo: {
        username: {
          key: ['Account\n(Student No.)', 'アカウント\n（学籍番号）', '账户\n（学生卡号）'],
          placeholder: ['Account', 'アカウント', '账户'],
        },
        passwd: {
          key: ['Password', 'パスワード', '密码'],
          placeholder: ['Password', 'パスワード', '密码'],
        },
        table: {
          key: ['Matrix Info.', 'マトリクスコード', '矩阵信息'],
          placeholder: ['Row {{row}}', '第 {{row}} 行', '第 {{row}} 行'],
        }
      },
      directLogin: [
        'Login when login page is opened',
        'ログイン画面が開けたらすぐにログイン',
        '在登录页面直接登录',
      ]
    }
  }
};


export default compileLanguageResource(langRes, langOrder);
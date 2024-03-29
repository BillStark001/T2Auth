# T2Auth

A Chrome extension to ease the use and improve user experience of the IT facilities in Tokyo Institute of Technology.

Currently it supports only auto-login and course calendar generation.

## Usage

### Options

You can select pages from the navigation bar on the left.
Importing and exporting options via JSON files is also possible in any page.

#### Options Page

* `Language` Currently supports English, Japanese and Simplified Chinese.
* `Auto Login`: If checked, he extension will log in when the portal page is opened
* `Periods`: The interval of each periods. Time table can be found on the official website and the Educational Web System system.

#### Account Info Page

The account, password and matrix authentication code is configured inside options page.
One can open options page by right-clicking the extension icon.

### Login

After the [Portal](https://portal.nap.gsic.titech.ac.jp) page is open, if `Auto Login` is checked,
the extension starts to log in automatically. Otherwise, the Matrix Code Authentication button needs to be manually clicked, and a hint is displayed under the button indicating that the extension is ready.

If there is any wrong info, an alert dialog will be popped.

### Generate Calendar

A button of label `Generate Calendar` will appear if available.

* After an OCW course detail page is opened, the button will appear on the right side under the course title.
* After the Course Registration page of the Educational Web System is opened, it will appear above the `Print` button.

After the button is clicked, one can set the interval of all quarters, choose which day to omit on the popped-up window.
Click the `Generate iCalendar File` on the bottom of the window, and a link will be generated.

The generated file's format is iCalendar format with extension `.ics`. It can be imported to common calendar management softwares like Google Calendar.

## Security

* All private information stored are encrypted by AES-256 using key and initial vector generated by the user's e-mail address & identification code. If no users are logged in to Chrome, a default key and iv will be used to encrypt and decrypt data instead.
  * This means:
    * If the user status is changed (e.g. you logged out or switched an account), the data stored inside the storage will be no longer usable.
    * If you leaked **both your e-mail and identification code**, then the data is possible to be decrypted by anyone who has the source code of this extension.
    * For more details, see <https://developer.chrome.com/docs/extensions/reference/identity/#method-getProfileUserInfo>
* No HTTP request is created directly by this extension during its lifetime.
  * This means no information is sent manually to any servers (including my private ones).
* You can output and input information in **plain text** in options page. Please store them in some location safe and trusted.

### Disclaimer

By using this extension you agree with **The developer of this extension is not responsible for any privacy leaks**.

## Development

The project uses

* [Vite](https://vitejs.dev/) and [CRXJS](https://crxjs.dev/) for packaging
* [Mithril.js](https://mithril.js.org/) for frontend rendering
* md5.js and [CryptoJS](https://github.com/brix/crypto-js) for encryption and decryption
* [ical.js](https://github.com/kewisch/ical.js) for calendar generation
* [day.js](https://day.js.org/) for immutable datetime representation
* [i18next](https://www.i18next.com/) for internationalization
* [Pure CSS](https://purecss.io/) for UI display.

If you want to build and debug in your own environment, follow [this instruction](https://crxjs.dev/vite-plugin/concepts/pages).

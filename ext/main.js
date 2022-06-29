// patterns
PAT_AUTH = [
    'input[type="button"][value="同意（マトリクス/OTP認証）"]', 
    'input[type="button"][value="Agree(Matrix|OTP Auth.)"]', 
    'input[type="button"][value="同意（マトリクス/OTP/ソフトトークン認証）"]', 
    'input[type="button"][value="Agree ( Matrix / OTP / Soft Token Auth.)"]', 
];

PAT_ACCOUNT = 'input.form-control[type="text"][name="usr_name"]';
PAT_PASSWD = 'input.form-control[type="password"][name="usr_password"]';
PAT_FORWARD = 'input[type="submit"][name="OK"]';

PAT_LOGOUT = 'a[href="/GetAccess/Logout"]';

// vars

var btnAuth, textAccount, textPasswd, btnForward, formAuth, btnLogout;
var inScreen1 = false,
    inScreen2 = false,
    inScreen3 = false,
    inScreen4 = false;
var inAtLeastOneScreen = () => inScreen1 || inScreen2 || inScreen3 || inScreen4;


// different screens

function procScreen1(directLogin) {
    console.log('Screen 1');
    if (directLogin)
        btnAuth.click();
}

function procScreen2(username, passwd) {
    // get username
    // get password
    console.log('Screen 2');
    if ((!isNormalVar(username) || String(username).length == 0) ||
        (!isNormalVar(passwd) || String(passwd).length == 0)) {
        alert('Tokyo Tech Authentication Kit: Invalid username or password. Please check options page.');
    } else {
        textAccount.value = username;
        textPasswd.value = passwd;
        btnForward.click();
    }
}

function procScreen3(table) {
    console.log('Screen 3');
    let auth = formAuth;
    // get table
    if (!isNormalVar(table) || String(table).length == 0 
        || String(table).startsWith('0000000000') || String(table).toUpperCase().startsWith('UNDEFINED')) {
        alert('Tokyo Tech Authentication Kit: Invalid matrix information. Please check options page.');
    } else {
        for (var i = 3; i < 6; ++i) {
            var a0 = auth.rows[i].cells[0];
            var pos = a0.textContent.charCodeAt(1) - 'A'.charCodeAt(0) + (a0.textContent.charCodeAt(3) - '1'.charCodeAt(0)) * 10;
            var a2 = auth.rows[i].cells[2];
            a2.children[0].children[0].children[1].value = table[pos];
        }
        btnForward.click();
    }
}

// main()

async function main(info) {

    let directLogin = info[0];
    let username = info[1];
    let passwd = info[2];
    let table = info[3];

    var handle = 114514;

    handle = setInterval(() => {
        btnAuth = querySelectors(document, PAT_AUTH);
        inScreen1 = isNormalVar(btnAuth);

        textAccount = document.querySelector(PAT_ACCOUNT);
        textPasswd = document.querySelector(PAT_PASSWD);
        btnForward = document.querySelector(PAT_FORWARD);
        inScreen2 = isNormalVar(textAccount) && isNormalVar(textPasswd) && isNormalVar(btnForward);

        formAuth = document.getElementById('authentication');
        inScreen3 = isNormalVar(formAuth) && isNormalVar(btnForward);

        btnLogout = document.querySelector(PAT_LOGOUT);
        inScreen4 = isNormalVar(btnLogout);

        if (inAtLeastOneScreen) {
            clearInterval(handle);
            if (inScreen1)
                procScreen1(directLogin);
            if (inScreen2)
                procScreen2(username, passwd);
            if (inScreen3)
                procScreen3(table);
            if (inScreen4)
                console.log('Logged In!');
        }
    }, 300);

}

console.log('Thanks for using the Authentication Kit.');
tryConnect(() =>
    chrome.runtime.sendMessage('getInitInfo', x => main(x)),
    150);
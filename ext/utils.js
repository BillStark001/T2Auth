// utils

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ?
                args[number] :
                match;
        });
    };
}

function querySelectors(target, selectors) {
    var ans = undefined;
    for (s of selectors) {
        ans = target.querySelector(s);
        if (isNormalVar(ans))
            break;
    }
    return ans;
}

async function loadJSON(url) {
    try {
        let response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.log('Request Failed');
        console.log(error);
    }
}

function convertType(s) {
    var s1 = s.split('_');
    var ans = '';
    for (var st of s1) {
        if (st.length > 0) {
            ans += st.charAt(0).toUpperCase() + st.substring(1).toLowerCase();
            ans += ' ';
        }
    }
    while (ans.charAt(ans.length - 1) == ' ') {
        ans = ans.substring(0, ans.length - 1);
    }
    return ans;
}

function createSelect(ops) {
    var ret = document.createElement('select');
    for (var op of ops) {
        var o = document.createElement('option');
        o.value = op[0];
        o.innerHTML = op[1];
        ret.appendChild(o);
    }
    return ret;
}

function isNormalVar(x) {
    return x != null && x != undefined;
}

function isIterable(obj) {
    if (obj == null || obj == undefined) 
        return false;
    return typeof(obj[Symbol.iterator]) === 'function';
}

// IO

function saveAs(blob, name) {
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', name);
    a.click();
}

function load(callback) {
    var inp = document.createElement('input');
    inp.setAttribute('type', 'file');
    inp.setAttribute('accept', '.json');
    inp.onchange = (e) => {
        var f = e.path[0].files[0];
        var r = new FileReader();
        r.onload = () => {
            var ans = JSON.parse(r.result);
            inp.value = '';
            if (typeof (callback) == 'function')
                callback(ans);
        };
        r.readAsText(f);
    };
    inp.click();
}

// background communication

function tryConnect(callback, timeout) {
    chrome.runtime.sendMessage('tryConnect', response => {
        if (chrome.runtime.lastError || response != true) {
            setTimeout(tryConnect, timeout, callback, timeout);
        } else {
            if (typeof (callback) == 'function')
                callback();
        }
    });
}

function safeSendMessage(msg, callback, timeout) {
    if (!isNormalVar(timeout))
        timeout = 200;
    chrome.runtime.sendMessage(msg, response => {
        if (chrome.runtime.lastError) {
            setTimeout(safeSendMessage, timeout, msg, callback, timeout);
        } else {
            if (typeof (callback) == 'function')
                callback(response);
        }
    });
}

// identity

const DEFAULT_KEY = 'default.email@tokyotech.auth.kit';
const DEFAULT_IV = '0011451401919810';

function getIdentity(callback) {
    try {
        chrome.identity.getProfileUserInfo({'accountStatus': 'ANY'}, x => {
            var xem = x.email;
            var xid = x.id;
            if (!isNormalVar(xem) || xem == '') 
                xem = DEFAULT_KEY;
            if (!isNormalVar(xid) || xid == '') 
                xid = DEFAULT_IV;
            var key = xem;
            var iv = xid;
            while (key.length < 32)
                key = key + xem;
            key = key.substring(0, 32);
            while (iv.length < 16)
                iv = iv + xid;
            iv = iv.substring(0, 16);
            callback(key, iv, undefined);
        });
    } catch (e) {
        if (typeof (callback) == 'function')
            callback(DEFAULT_KEY, DEFAULT_IV, e);
    }
}

// requires md5
function getFingerPrint(key, iv) {
    return md5(key + iv);
}

// requires CryptoJS
function encryptAES(word, keystr, ivstr) {
    let key = CryptoJS.enc.Utf8.parse(keystr);
    let iv = CryptoJS.enc.Utf8.parse(ivstr);
    let srcs = CryptoJS.enc.Utf8.parse(JSON.stringify(String(word)));
    var encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.ciphertext.toString().toUpperCase();
}

// requires CryptoJS
function decryptAES(word, keystr, ivstr) {
    let key = CryptoJS.enc.Utf8.parse(keystr);
    let iv = CryptoJS.enc.Utf8.parse(ivstr);
    let encryptedHexStr = CryptoJS.enc.Hex.parse(String(word));
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    var decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    try { decryptedStr = JSON.parse(decryptedStr); } catch (e) {}
    return decryptedStr.toString();
}
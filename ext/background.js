importScripts('imported/cryptojs.js');
importScripts('imported/md5.js');
importScripts('utils.js');

var initialized = false;
var getPrivateInformation = null;

const allOptions = {
    'username': '',
    'passwd': '',
    'table': '',
    'fingerprint': 'none',
    'directLogin': false
}

function decryptInfo(u, p, t, k, i, f) {
    var check = getFingerPrint(k, i) == f;
    if (!check) {
        try {
            var du = decryptAES(u, k, i);
            var dp = decryptAES(p, k, i);
            var dt = decryptAES(t, k, i);
            return [du, dp, dt, check];
        } catch (e) {
            return ['', '', e.message, check];
        }
    }
    var du = decryptAES(u, k, i);
    var dp = decryptAES(p, k, i);
    var dt = decryptAES(t, k, i);
    return [du, dp, dt, check];
}

function encryptInfo(u, p, t, k, i) {
    var du = encryptAES(u, k, i);
    var dp = encryptAES(p, k, i);
    var dt = encryptAES(t, k, i);
    var fp = getFingerPrint(k, i);
    return {
        fingerprint: fp,
        username: du,
        passwd: dp,
        table: dt
    };
    // return [fp, du, dp, dt];
}

async function bgmain() {

    const STORAGE = chrome.storage.sync;

    // fetch options
    var options = await STORAGE.get(allOptions);

    // initialize settings after installation
    console.log('Initializing options...');
    var problematicOptions = {};
    for (var key in allOptions) {
        // this will become problematic if there are any arrays inside arrays.
        if (!isNormalVar(options[key]))
            problematicOptions[key] = allOptions[key];
    }
    if (Object.keys(problematicOptions).length != 0) {
        console.log(problematicOptions);
        await STORAGE.set(problematicOptions);
        options = await STORAGE.get(allOptions);
    }
    console.log('Options successfully initialized.');
    console.log(options);

    // register option changing listener
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        for (let [key, {
                oldValue,
                newValue
            }] of Object.entries(changes)) {
            if (newValue == undefined)
                newValue = allOptions[key];
            console.log(`[${key}]: '${oldValue}' -> '${newValue}'`);
            if (namespace == 'local') {
                throw new Error('This should never happen. Please contact the developers.');
            } else if (namespace == 'sync') {
                options[key] = newValue;
            }
        }
    });

    // register message listener

    const strproto = new String().__proto__;
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

        if (typeof (message) == 'string' || message.__proto__ == strproto) {

            if (message == 'tryConnect') {
                sendResponse(initialized);
            } else if (message == 'getInitInfo') {
                getIdentity((k, i, e) => {
                    var dec = decryptInfo(
                        options.username,
                        options.passwd,
                        options.table,
                        k,
                        i,
                        options.fingerprint
                    );
                    var res = [options.directLogin, ...dec];
                    sendResponse(res);
                });

            } else if (message == 'syncDel') {
                // TODO
                STORAGE.clear();
                sendResponse('All private information deleted.')

            } else {
                sendResponse(`Unknown Message: ${message}`);
                return false;
            }
        } else if (typeof (message) == 'object') {
            let msg = message.msg;
            if (msg == 'setInformation') {
                var opt = message.data;
                if (msg.setDirectLogin == true)
                    STORAGE.set({'directLogin': opt.directLogin == true});
                getIdentity((k, i, e) => {
                    var enc = encryptInfo(
                        opt.username,
                        opt.passwd,
                        opt.table,
                        k,
                        i
                    );
                    STORAGE.set(enc);
                    sendResponse('Information update successful' + (isNormalVar(e) ? ', but default key and iv is used.' : '.'));
                });
            } 
        } else {
            sendResponse(`Unknown Message: ${JSON.stringify(message)}`);
            return false;

        }
        return true;
    });
    /*
    chrome.action.onClicked.addListener(function (activeTab) {
        chrome.tabs.create({
            url: chrome.runtime.getURL('https://portal.titech.ac.jp/')
        });
    });
    */
    initialized = true;
}

bgmain();

chrome.runtime.onConnect.addListener(port => {
    console.log(`Connection to background established on port ${port}.`);
    console.log(port);
    console.log(initialized ? 'Initialized.' : 'Not initialized.');
});
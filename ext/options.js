const ctrls = (() => {
    var ans = {};
    for (var cn of ['account', 'passwd', 'mat-r1', 'mat-r2', 'mat-r3', 'mat-r4', 'mat-r5', 'mat-r6', 'mat-r7',
            'submit', 'input', 'output', 'direct-login', 'syncup', 'syncdown', 'syncdel'
        ]) {
        ans[cn.replace('-', '_')] = ans[cn] = document.getElementById(cn);
    }
    return ans;
})();

function legalizeMatrixRow(strRaw) {
    return (String(strRaw).replace(' ', '').replace('　', '') + '0000000000').substring(0, 10).toUpperCase();
}

function checkAndFormInfo() {
    let acc = ctrls.account.value;
    let pwd = ctrls.passwd.value;
    var vt = true;
    var alerts = '';
    if (acc.length == 0) {
        vt = false;
        alerts += 'Please input your account!\n';
    }
    if (pwd.length == 0) {
        vt = false;
        alerts += 'Please input your password!\n';
    }
    var mat = '';
    for (var i = 1; i <= 7; ++i) {
        var vt1 = true;
        let tmat = legalizeMatrixRow(ctrls['mat-r' + i].value);
        if (tmat.indexOf('0') >= 0) {
            vt1 = false;
        } else {
            for (var j = 0; j < 10; ++j)
                if (tmat.charCodeAt(i) > 'Z'.charCodeAt(0) ||
                    tmat.charCodeAt(i) < 'A'.charCodeAt(0))
                    vt1 = false;
        }
        mat = mat + tmat;
        if (vt1 != true) {
            vt = false;
            alerts += 'Invalid data at matrix info line ' + i + '!\n';
        }

    }
    return [vt, alerts, {
        username: acc,
        passwd: pwd,
        table: mat
    }];

}

function setMatrixTable(tbl) {
    tbl = String(tbl);
    for (var i = 0; i < 7; ++i) {
        var matRow = ctrls[`mat_r${i+1}`];
        matRow.value = legalizeMatrixRow(tbl.substring(i * 10, i * 10 + 10));
    }
}

async function optmain(info) {

    // init data

    ctrls.direct_login.checked = info[0] === true;
    if (!info[4])
        alert('Data corrupted or no data is stored.');
    ctrls.account.value = info[1];
    ctrls.passwd.value = info[2];
    setMatrixTable(info[3]);

    // set event

    for (var i = 1; i <= 7; ++i) {
        let ml = ctrls[`mat-r${i}`];
        ml.onchange = x => ml.value = legalizeMatrixRow(ml.value);
    }

    ctrls.submit.onclick = () => {
        var pwd = checkAndFormInfo();
        var msg =  {
            msg: 'setInformation', 
            data: pwd[2], 
            setDirectLogin: false
        };
        safeSendMessage(msg, x => alert(x));
        // TODO
    };

    var dloc = () => {
        let v = ctrls.direct_login.checked;
        chrome.storage.sync.set({
            'directLogin': v
        });
    };
    ctrls.direct_login.onchange = dloc;

    ctrls.output.onclick = () => {
        var rawContent = checkAndFormInfo()[2];
        rawContent['directLogin'] = ctrls.direct_login.checked == true;
        var content = JSON.stringify(rawContent);
        console.log(content);
        var blob = new Blob([content], {
            type: "text/plain;charset=utf-8"
        });
        saveAs(blob, "options.json");
    };

    ctrls.input.onclick = () => {
        load(ans => {
            ctrls.direct_login.checked = ans.directLogin;
            dloc();
            ctrls.account.value = ans.username;
            ctrls.passwd.value = ans.passwd;
            setMatrixTable(ans.table);
            var msg = {
                msg: 'setInformation',
                data: ans, 
                setDirectLogin: true
            };
            safeSendMessage(msg, x => alert(x));
        });
    }

    ctrls.syncdel.onclick = () => {
        safeSendMessage('syncDel', x => alert(x));
        ctrls.account.value = '';
        ctrls.passwd.value = '';
        for (var k of ['mat-r1', 'mat-r2', 'mat-r3', 'mat-r4', 'mat-r5', 'mat-r6', 'mat-r7'])
            ctrls[k].value = '0000000000';
    };

}

var port = chrome.runtime.connect(null, {
    name: 'options page'
});
port.onDisconnect.addListener(obj => {
    console.log('Disconnected from background');
    port = chrome.runtime.connect(null, {
        name: 'options page'
    });
})

tryConnect(() =>
    chrome.runtime.sendMessage('getInitInfo', x => optmain(x)),
    300);
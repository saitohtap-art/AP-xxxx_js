//3270区分機 デンソー大安

const CODE_SEQNO = "583";  //コード SEQNO.No.
const CODE_KUMITUKE = "121";  //コード 組付区

let pocketsData = new Array ();  //割当済ポケットの読取データ
let pocketsCount = new Array ();  //割当済ポケット内の枚数
let qrData = "";  //ターゲットのQRデータ

//動作設定コマンド
document.getElementById('command').value = "LQ009\\r";  //CRコードの\rは\\rと記述する
commandChange();

//ポケット設定 画面生成
document.getElementById('addonDisp').appendChild(document.createElement('br'));

const label1 = document.createElement('label');
label1.textContent = "　ポケット　最大";
const input1 = document.createElement('input');
input1.type = "number";
input1.id = "pocketMax";
input1.style.width = "3em";
input1.min = "1";
input1.max = "99";
input1.value = "21";
label1.appendChild(input1);
document.getElementById('addonDisp').appendChild(label1);

const label2 = document.createElement('label');
label2.textContent = "　エラー";
const input2 = document.createElement('input');
input2.type = "number";
input2.id = "errPocket";
input2.style.width = "3em";
input2.min = "1";
input2.max = "99";
input2.value = "21";
label2.appendChild(input2);
document.getElementById('addonDisp').appendChild(label2);

//仕訳パターン選択
const label3 = document.createElement('label');
label3.textContent = "　仕訳パターン";
const patternSelect = document.createElement('select');
let patternNames = new Array(
    "SEQ_No",
    "組付区",
    "仕分済みキーデータで検索",
    "サンプル１",
    "サンプル５"
); 
//選択項目追加
var i = 0;
for (var name of patternNames) {
    const pattern = document.createElement('option');
    pattern.value = `pattern${++i}`;
    pattern.text = name;
    patternSelect.appendChild(pattern);
}
label3.appendChild(patternSelect);
document.getElementById('addonDisp').appendChild(label3);

document.getElementById('statusDisp').appendChild(document.createElement('br'));

//ポケット仕訳データ確認 ボタン生成
const button1 = document.createElement('button');
button1.textContent = "ポケット仕訳データ確認";
button1.style.backgroundColor = "yellow";
document.getElementById('statusDisp').appendChild(button1);

button1.onclick = function(e) {
    addStatus("\n◆◆ ポケット仕訳データ ◆◆ " + new Date().toLocaleString('ja-JP') + "\n");
    for (let i = 0; i < pocketsData.length; i++) {
        if (pocketsData[i] == "" && readErrCount > 0) {
            addStatus(String(i + 1).padStart(2, '0') + "：" + String(readErrCount).padStart(3) + "：エラーポケット\n");
        } else {
            addStatus(String(i + 1).padStart(2, '0') + "：" + String(pocketsCount[i]).padStart(3) + "：" + pocketsData[i] + "\n");
        }
    }
    if (pocketsData.length < Number(document.getElementById('errPocket').value) && readErrCount > 0) {
        addStatus((document.getElementById('errPocket').value).padStart(2, '0') + "：" + String(readErrCount).padStart(3) + "：エラーポケット\n");
    } 
};

const span = document.createElement('span');
span.textContent = "　　";
document.getElementById('statusDisp').appendChild(span);

//全データクリア ボタン生成
const button2 = document.createElement('button');
button2.textContent = "全データクリア";
button2.style.backgroundColor = "red";
document.getElementById('statusDisp').appendChild(button2);

button2.onclick = function(e) {
    let result = confirm("全ての読取データを削除します。よろしいですか？");
    if (result) {
        document.getElementById('readDataArea').value = "";
        document.getElementById('readOk').value = "";
        readOkCount = 0;
        document.getElementById('readErr').value = "";
        readErrCount = 0;
        document.getElementById('statusArea').value = "";
        pocketsData.length = 0;
        pocketsCount.length = 0;
        addStatus("全データを削除しました。\n");
    }
};

//仕分けキー検索
function sortKey(keyCode) {
    let data = receiveStr.split(",");
    qrData = "";
    for (let d of data) {
        if (d.indexOf("JAMA") == 0) {
            let idCount = Number(d.substr(16, 3));  //ID項目数
            let idIndex = 19;
            let dataIndex = 19 + idCount * 5; 
            for (let i = 0; i < idCount; i++) {
                let code = d.substr(idIndex, 3);  //コードNo.
                let dataLen = Number(d.substr(idIndex + 3, 5));  //データ桁数
                if (code == keyCode) {
                    qrData = d;
                    return d.substr(dataIndex, dataLen);
                }
                idIndex += 5;
                dataIndex += dataLen;
            }
        }
    }
    return "";
}

//仕分済みキーデータで検索
function sortKey2() {
    let data = receiveStr.split(",");
    qrData = "";
    for (let d of data) {
        for (let keyData of pocketsData) {
            if (d.indexOf(keyData) >= 0) {
                qrData = d;
                return keyData;
            }
        }
    }
    return "";
}

//サンプル１
function sortKey3() {
    let data = receiveStr.split(",");
    qrData = "";
    for (let d of data) {
        //サンプル1-1
        if (d.length == 38) {  //文字数38
            qrData = d;
            return d.substr(0, 5);
        }
        //サンプル1-2
        if (d.length == 24) {  //文字数24
            if (d[6] != "-") { //DN品番7桁目"-"なし
                qrData = d;
                return d.substr(0, 5);
            }
        }
    }
    return "";
}

//サンプル５　組付区ではなくSEQ.No.で仕訳する
function sortKey4() {
    let data = receiveStr.split(",");
    qrData = "";
    for (let d of data) {
        //サンプル5-1
        if (d.length == 38) {  //文字数38
            qrData = d;
            return d.substr(0, 5);
        }
        //サンプル5-2
        if (d.length == 28) {  //文字数28
            qrData = d;
            return d.substr(-5, 5);
        }
    }
    return "";
}

//読取OK時の処理
//  receiveBytes：受信データ（バイト列） receiveStr：受信データ（文字列） qrDataStr：QR読取データ rfidDataStr：RFID読取データ
function readOk() {
    //仕訳キーデータ
    switch (patternSelect.value) {
        case "pattern1":
            var data = sortKey(CODE_SEQNO);  //SEQ.No.仕分け
            break;
        case "pattern2":
            var data = sortKey(CODE_KUMITUKE);  //組付区仕分け
            break;
        case "pattern3":
            var data = sortKey2();  //仕分け済みキーデータ
            break;
        case "pattern4":
            var data = sortKey3();  //サンプル１
            break;
        case "pattern5":
            var data = sortKey4();  //サンプル５
            break;
        default:
            alert("仕訳パターンが見つかりません。")
    }
    if (data == "") {
        addStatus("仕訳キーデータが見つかりません。エラーポケットへ排出します。\n");
        readErr();
        return;
    }

    //alert("QRデータ：" + qrData + " キーデータ：" + data);

    //ポケット指定
    let pocket = pocketsData.indexOf(data);  //ポケット検索
    if (pocket < 0) {
        //新規ポケットを割当
        if ((pocketsData.length + 1) == Number(document.getElementById('errPocket').value)) {  //エラーポケットをチェック
            pocketsData.push("");
            pocketsCount.push(0);
        }
        if (pocketsData.length < Number(document.getElementById('pocketMax').value)) {  //最大ポケット数チェック
            pocketsData.push(data);
            pocketsCount.push(1);
            pocket = pocketsData.length;
            addStatus("ポケット割当（" + String(pocket).padStart(2, "0") + "：" + data + "）\n");
        } else {
            addStatus("ポケットが不足しているため、エラーポケットへ排出します。\n");
            readErr();
            return;
        }
    } else {
        //ポケット割当済
        if (duplicateFlag) {
            addStatus("重複データが存在します。データを無視して正常ポケットへ排出します。\n");
        } else {
            pocketsCount[pocket]++;
            pocket++;
        }
    }
    addReadData(qrData + "\n");  //ターゲットQRの読取データ追加
    //addReadData(receiveStr + "\n");  //読取データ追加
    document.getElementById('readOk').value = String(++readOkCount);  //OKカウント
    sendCommand("P" + String(pocket).padStart(2, "0") + "\r");  //正常排出
}

//読取エラー時の処理
function readErr() {
    if (digitsFlag == 1) addStatus("データの桁数が異なるため、エラーポケットへ排出します。\n");
    if (duplicateFlag == 1) addStatus("重複データが存在するため、エラーポケットへ排出します。\n");
    document.getElementById('readErr').value = String(++readErrCount);  //ERRカウント
    sendCommand("P" + document.getElementById('errPocket').value.padStart(2, "0") + "\r");  //エラー排出
    input2.readOnly = true;  //エラーポケットの変更を不可にする
}

addStatus("拡張機能ファイル読込：区分機 DN大安\n");
//alert("ポケット設定をしてください。\n");

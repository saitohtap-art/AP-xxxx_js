//3270区分機 順仕訳 サンプル

const matchPatternStr = "";  //未指定時は全文字
//const matchPatternStr = "(?<=^.{2}).{4}";  //例）先頭より3文字目から4文字取得
//const matchPatternStr = "(?<=target).{6}";  //例）文字列targetより6文字取得
let pocketsData = new Array ();  //割当済ポケットの読取データ
let pocketsCount = new Array ();  //割当済ポケット内の枚数

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

const label3 = document.createElement('label');
label3.textContent = "　抽出パターン";
const input3 = document.createElement('input');
input3.type = "text";
input3.id = "matchPattern";
input3.size = "20";
input3.placeholder = "正規表現 match パターン";
input3.value = matchPatternStr;
label3.appendChild(input3);
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

//読取OK時の処理
//  receiveBytes：受信データ（バイト列） receiveStr：受信データ（文字列） qrDataStr：QR読取データ rfidDataStr：RFID読取データ
function readOk() {
    //仕訳キーデータ
    let data = receiveStr;
    if (document.getElementById('matchPattern').value != "") {  //パターン未入力時は全データをキーにする
        try {
            const regex = new RegExp(document.getElementById('matchPattern').value);
            data = String(data.match(regex));  //キーデータ抽出
        } catch {
            data = "";
        }
        if (data == "" || data == "null") {
            addStatus("仕訳キーデータが見つかりません。エラーポケットへ排出します。\n");
            readErr();
            return;
        }
    }

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
    addReadData(receiveStr + "\n");  //読取データ追加
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

addStatus("拡張機能ファイル読込：区分機 順仕訳\n");
//alert("ポケット設定をしてください。\n");

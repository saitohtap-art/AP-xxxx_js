//マスターチェック サンプル

let masterData = "";  //マスターデータ
const terminator = "\r\n";  //マスターデータの終端コード
const matchPatternStr = "";  //抽出パターン 未指定時は全文字
//const matchPatternStr = "(?<=^.{2}).{4}";  //例）先頭より3文字目から4文字取得
//const matchPatternStr = "(?<=target).{6}";  //例）文字列targetより6文字取得

//ローカルのファイルを読込時
//ファイル選択ボタン追加
const inputFile = document.createElement('input');
inputFile.type = "file";
inputFile.accept = ".csv,.txt";
document.getElementById('addonDisp').appendChild(inputFile);  //ファイル選択ボタン要素を作成

//ファイル読込（ブラウザのセキュリティにてユーザーでの選択が必要）
inputFile.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    addStatus("マスターファイル読込：" + file.name + "（" +  file.size + " byte）\n");
    const reader = new FileReader(); // FileReaderオブジェクトを作成
    reader.onload = function(e) {  //読み込み完了後の処理
        masterData = e.target.result;
    };
    reader.readAsText(file); //テキストデータとして読込
};
/*
//サーバーのファイルを読込時（HTTPリクエストが可能な環境）
async function loadFile() {
    const filename = "masterData.csv";  //マスターファイル名
    const response = await fetch(filename);  //ファイル読み込み
    if (response.ok) {  //ステータスコードが200の場合、成功
        //UTF-8
        masterData = await response.text();  //テキストデータとして読込
        masterData
    
        //SJISエンコード
        //const arrayBuffer = await response.arrayBuffer();  //バイト列データとして読込
        //masterData = new TextDecoder('shift-jis').decode(arrayBuffer);
        addStatus("マスターファイル読込：" + filename + "（" +  String(masterData.length) + " byte）\n");
    } else {
        alert("マスターファイルの読込に失敗しました。");
    }
}
loadFile();
*/
//読取データ抽出パターン 画面生成
document.getElementById('addonDisp').appendChild(document.createElement('br'));

const label = document.createElement('label');
label.textContent = "　読取データ抽出パターン";
const input = document.createElement('input');
input.type = "text";
input.id = "matchPattern";
input.size = "20";
input.placeholder = "正規表現 match パターン";
input.value = matchPatternStr;
label.appendChild(input);
document.getElementById('addonDisp').appendChild(label);

//読取OK時の処理
//  receiveBytes：受信データ（バイト列） receiveStr：受信データ（文字列） qrDataStr：QR読取データ rfidDataStr：RFID読取データ
function readOk() {
    if (duplicateFlag) {
        addStatus("重複データが存在します。データを無視してOK排出します。\n");
    } else {
        //読取データ抽出
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

        //マスターチェック
        if ((terminator + masterData).indexOf(terminator + data + terminator) < 0) {  //読取データの先頭・末尾に終端コード追加して検索
            addStatus("読取データがマスターファイル内に見つかりません。エラー排出します。\n");
            readErr();  //読取エラー時の処理
            return;
        }
        addReadData(receiveStr + "\n");  //読取データ追加
        document.getElementById('readOk').value = String(++readOkCount);  //OKカウント
    }
    sendCommand("P00\r");  //正常排出
}
/*
//読取エラー時の処理
function readErr() {
    if (digitsFlag == 1) addStatus("データの桁数が異なるため、エラー排出します。\n");
    if (duplicateFlag == 1) addStatus("重複データが存在するため、エラー排出します。\n");
    document.getElementById('readErr').value = String(++readErrCount);  //ERRカウント
    sendCommand("P01\r");  //エラー排出
}
*/
addStatus("拡張機能ファイル読込：マスターチェック\n");
//alert("マスターファイルを選択してください。\n");

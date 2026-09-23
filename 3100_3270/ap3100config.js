//AP-3100設定（デフォルト設定、拡張機能）

//タイトル
document.getElementById('titleDisp').textContent = "AP-3100シリーズ テスト  Ver1.0"

//シリアル通信設定
document.getElementById('baudRateSelect').value = "38400";  //ボーレートbps 4800 9600 19200 38400 57600 115200
document.getElementById('bitParityStopSelect').value = "8N1";  //通信設定 8N1 8E1 8O1 7N1 7E1 7O1
document.getElementById('flowSelect').value = "none";  //フロー制御 none hardware software

//読取設定
document.getElementById('mode').value = "0";  //読取モード 0 1 2
document.getElementById('start').value = "0";  //RFID開始ブロック 0～98
document.getElementById('block').value = "0";  //RFIDブロック数 0～98
document.getElementById('uid').checked = false;  //UID true false
//設定内容を反映
modeChange();
rfidChange();
uidChange();

//動作設定コマンド
document.getElementById('command').value = "";  //CRコードの\rは\\rと記述する
commandChange();  //各設定内容を反映

//設定項目等を非表示にする場合
//document.getElementById('settingDisp').style.display = "none";  //各種設定
    //document.getElementById('serialDisp').style.display = "none";  //シリアル通信設定
    //document.getElementById('modeDisp').style.display = "none";  //読取設定
    //document.getElementById('commandDisp').style.display = "none"; 　//動作設定コマンド
//document.getElementById('addonDisp').style.display = "none";  //拡張機能
//document.getElementById('startProcessDisp').style.display = "none";  //処理開始
//document.getElementById('readDataDisp').style.display = "none";  //読取データ
//document.getElementById('statusDisp').style.display = "none";  //ステータスログ
//document.getElementById('debugDisp').style.display = "none";  //デバッグ

//拡張機能
let addons = new Array(  //"ファイル名:表示名"
    "ap3100changeSetting.js:設定変更",
    "ap3100masterCheck.js:マスターチェック",
    "ap3270sorterSequence.js:3270区分機 順仕訳",
    "ap3270sorterDNdaian.js:3270区分機 DN大安"
); 
//拡張機能 項目追加
for (var addon of addons) {
    const option = document.createElement('option');
    var strAry = addon.split(":");
    option.value = strAry[0];
    option.text = strAry[1];
    document.getElementById('addonSelect').appendChild(option);
}
//拡張機能 表示
document.getElementById('addonDisp').style.display = 'block';
//自動で選択する場合
//document.getElementById('addonSelect').selectedIndex = 1;
//addonSelectChange();

//alert("設定ファイルを読込ました。\n");

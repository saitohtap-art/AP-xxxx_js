//設定切替サンプル

//タイトル
document.getElementById('titleDisp').textContent = "AP-3100シリーズ テスト 設定１"

//シリアル通信設定
document.getElementById('baudRateSelect').value = "115200";  //ボーレートbps 4800 9600 19200 38400 57600 115200
document.getElementById('bitParityStopSelect').value = "8E1";  //通信設定 8N1 8E1 8O1 7N1 7E1 7O1
document.getElementById('flowSelect').value = "hardware";  //フロー制御 none hardware software

//読取設定
document.getElementById('mode').value = "1";  //読取モード 0 1 2
document.getElementById('start').value = "0";  //RFID開始ブロック 0～98
document.getElementById('block').value = "10";  //RFIDブロック数 0～98
document.getElementById('uid').checked = true;  //UID true false
//設定内容を反映
modeChange();
rfidChange();
uidChange();

//動作設定コマンド
document.getElementById('command').value = "B1\\r,LR010\\r";  //CRコードの\rは\\rと記述する
commandChange();  //設定内容を反映

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

addStatus("拡張機能ファイル読込：設定１切替\n");

//設定読込と同時にポートオープンする場合
openClick();

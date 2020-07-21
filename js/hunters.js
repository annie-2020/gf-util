 /**
  * ハンターズで相手チームの一覧を生成する
  * @author annie
  * @version 0.3
  */

var partyEstablishedUsereMap = new Map();  ///< ID/NAMEのMAP。パーティ作成メンバー情報を確保する
var enemyUserMap = new Map();  ///< 作成メンバーID/ユーザ情報リストのMAP

 /**
  * メンバー変数をクリア
  *
  * @author annie
  * @version 0.3
  */
function clearHunterData(){
  partyEstablishedUsereMap = new Map();
  enemyUserMap = new Map();
}

 /**
  * 取得した情報から敵チームを表示する
  *
  * @author annie
  * @version 0.3
  */
function createHunterEnemyHTML() {
  /// ドキュメント出力開始
  var obj = window.open();
  obj.document.open();
  obj.document.write("<HTML><HEAD><meta charset = utf-8><link rel=\"stylesheet\" href=\"style.css\"></HEAD><BODY>");

  obj.document.write("<H1>敵チーム</H1>");

  {
    var keyList = enemyUserMap.keys();
    var valueList = enemyUserMap.values();

    var strTeamName = "<TABLE border=1><TR><TD>班名</TD>";
    for( key of keyList){
      strTeamName = strTeamName + "<TD class=Team>" + partyEstablishedUsereMap.get(key) + "班</TD>";
    }
    obj.document.write( strTeamName + "</TR>");

    var objectList = [];
    for( value of valueList){
      objectList.push(value);
    }
    for ( let i = 0 ; i < 10 ; i++) {   /// 班員一覧を表示
      obj.document.write(" <TR><TD rowspan=2>" + ( i + 1 ) + "</TD><TD class=odd> <a target=\"_blank\" href=\"https://vcard.ameba.jp/profile?userId=" + objectList[0][i].userId + "\">" + objectList[0][i].userName + "</A>" +
                         "</TD><TD class=even><a target=\"_blank\" href=\"https://vcard.ameba.jp/profile?userId=" + objectList[1][i].userId + "\">" + objectList[1][i].userName + "</A>" +
                         "</TD><TD class=odd> <a target=\"_blank\" href=\"https://vcard.ameba.jp/profile?userId=" + objectList[2][i].userId + "\">" + objectList[2][i].userName + "</A>" +
                         "</TD><TD class=even><a target=\"_blank\" href=\"https://vcard.ameba.jp/profile?userId=" + objectList[3][i].userId + "\">" + objectList[3][i].userName + "</A>" +
                         "</TD><TD class=odd> <a target=\"_blank\" href=\"https://vcard.ameba.jp/profile?userId=" + objectList[4][i].userId + "\">" + objectList[4][i].userName + "</A></TD></TR>");
      obj.document.write( "<TR><TD class=odd>" +
                          objectList[0][i].clubName + "</TD><TD class=even>" + 
                          objectList[1][i].clubName + "</TD><TD class=odd>" + 
                          objectList[2][i].clubName + "</TD><TD class=even>" + 
                          objectList[3][i].clubName + "</TD><TD class=odd>" + 
                          objectList[4][i].clubName + "</TD></TR>");
    }
  }

  obj.document.write("</TABLE></BODY></HTML>");
  obj.document.close();
  clearHunterData();
}

 /**
  * デイリーのユーザ情報を取得する
  * 再帰関数もどき。(実際には「XMLHttpRequest」の非同期関数「onreadystatechange」で途切れてる)
  *
  * @param index デイリーのページインデックス。1から開始
  * @author annie
  * @version 0.3
  */
function getDailyTeamData(index , eventId , dayNumber){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function( ) {
    if ( xhr.readyState == 4 && xhr.status == 200) {         ///< 情報取得完了
      var myArr = JSON.parse(xhr.responseText);              ///< JSON読み込み
      for(data of myArr.data.rankings.list){                 ///< 1ページに表示するの数(最大10人)
        if(!data.enemy){
          continue;
        }
        var person = new Object();
        person.clubName = data.clubName;   ///< 部活名
        person.userId   = data.userId;     ///< ユーザID
        person.userName = data.userName;   ///< ユーザ名

        var setList = [];  /// ユーザ情報を登録する
        if(enemyUserMap.has(data.iRaidwarParty.entryUserId)){         ///< 班を設立したユーザIDでリストを作成する
          setList = enemyUserMap.get(data.iRaidwarParty.entryUserId);
        }
        setList.push(person);
        enemyUserMap.set(data.iRaidwarParty.entryUserId , setList);
        if(person.userId == data.iRaidwarParty.entryUserId){   /// 設立ユーザ名を保持する
          partyEstablishedUsereMap.set(data.iRaidwarParty.entryUserId , person.userName);
        }
      }

      if(index*10 < myArr.data.rankings.allCount ){ ///< まだ存在する場合、同関数を呼び出す
        getDailyTeamData(index+1 , eventId , dayNumber);
      }else{
        if(partyEstablishedUsereMap.length == 0){
          alert("情報が取得できませんでした。処理を終了します" );
          return;
        }
        createHunterEnemyHTML();
      }
    }
  }


  /// イベントIDからデイリーランキングの情報を取得する
  var url = 'https://vcard.ameba.jp/raidwar/ranking/ajax/team?&eventId='+ eventId + '&page=' + index + '&num=' + dayNumber;
  xhr.open( 'GET', url, true ) ;
  xhr.send( ) ;
}

 /**
  * 外部から呼ばれる、メニューで指定したレアリティのカードを収集する
  * @author annie
  * @version 0.1
  */
function getHuntersTeam() {

  clearHunterData();
  getEventNumber();
}

 /**
  * イベント情報を取得する
  * @author annie
  * @version 0.3
  */
function getEventNumber(){
  chrome.tabs.query({}, function (tabs) {    ///< 全タブを取得する
    for (tab of tabs) {
      if(tab.url.indexOf("vcard") != -1 && tab.url.indexOf(_eventId) != -1){  // URLに「vcard」かつ「eventId」が入っている個所を確認する
        var urlSprit = tab.url.split(/[\?\/\&]/);  ///< 「?」「/」「&」でURLを分割する。フォルダ名とファイル名、引数で分割される
        var eventId = "";
        var hunters = false;
        var dayNumber = "1";
        for(split of urlSprit){
          if(split == "raidwar"){
            hunters = true;
          }
          if(split.indexOf("num=") != -1){
            dayNumber = split.substr("num".length + 1);
          }
          if(eventId == ""){
            if(split.indexOf(_eventId) != -1){
              eventId = split.substr("eventId".length + 1);
            }
          }
        }
        if(hunters && eventId != "" && dayNumber != "" ){
          alert( dayNumber + "日目の相手チーム一覧を表示します");
          getDailyTeamData(1 , eventId , dayNumber);
          return;
        }
      }
    }
    /// エラー時の処理
    alert("イベントページが見つかりません。ハンターズ期間であること、URLに\"eventId\"が含まれているか確認してください");
  });
}


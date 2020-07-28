 /**
  * 指定された順位のポイント表示
  * @author annie
  * @version 0.3
  */

const _eventName = [ "raid" , "raidwar" , "story" , "clubcup" , "championship"];
                                                      ///< URL上のイベント名。「レイド,ハンターズ,ふむふむ,対抗戦,カリスマ」
const _eventId = "eventId";                           ///< イベントIDの識別プレフィックス

 /**
  * 取得した情報から最終結果を表示する
  * @param array    取得情報の配列
  * @param ranking  ユーザに入力された順位
  * @author annie
  * @version 0.1
  */
function createRankHTML(array , ranking) {
  var obj = window.open('about:blank',"eventTab");
  obj.document.open();
  obj.document.write("<HTML><HEAD><meta charset = utf-8><link rel=\"stylesheet\" href=\"style.css\"></HEAD><BODY>");

  obj.document.write("<H1>" + ranking + "位付近のポイント</H1>");
  obj.document.write("<BUTTON class='RankUpdate'>更新</BUTTON>");
  ///ヘッダ出力
  obj.document.write("<TABLE border=1><TR><TD>順位</TD><TD>ポイント</TD><TD>ユーザ</TD></TR>\n");

  for (element of array) {
    if(ranking == element.rank){
      ///指定された順位の場合だけ、背景色を変更する
      obj.document.write("<TR><TD class=rankSame>"+ element.rank +"</TD><TD class=rankSame><B>" + element.point + "</B></TD>");
      obj.document.write("<TD class=rankSame><a href=\"https://vcard.ameba.jp/profile?userId=" + element.userId + "\">" + element.userName + "</A></TD></TR>\n");
    }else{
      obj.document.write("<TR><TD class=rank>"+ element.rank +"</TD><TD class=rank><B>" + element.point + "</B></TD>");
      obj.document.write("<TD class=rank><a target=\"_blank\" href=\"https://vcard.ameba.jp/profile?userId=" + element.userId + "\">" + element.userName + "</A></TD></TR>\n");
    }
  }
  obj.document.write("</TABLE></BODY></HTML>");
  obj.document.close();
  obj.document.querySelector('button.RankUpdate').addEventListener('click',()=>{
    getRank(ranking);
  });
}

 /**
  * URLから確認した情報をもとに、表示するための情報をAJAXからJSONで取得する
  * @param eventId      イベントID。各イベントには開始ごとに連番でIDが与えられる
  * @param eventName    イベント名。配列にすべて記載する
  * @param ranking      ユーザに入力された順位
  * @author annie
  * @version 0.1
  */
function getDisplayData(eventId , eventName , ranking){
  ///< 与えられた順位が表示されるページ。「1～10」→ 1になるように小数点切り上げ。
  var eventPageStr = "?eventId=" + eventId + "&page=" + Math.ceil( ranking / 10);

//  var url = "https://vcard.ameba.jp/" + eventName + "/ajax/ranking-search" + eventPageStr;  ///< JSONを取得するURL
  var url = "https://vcard.ameba.jp/";
  switch(eventName){
   case _eventName[0]: ///< レイド
     url = url + eventName + "/ajax/ranking-search" + eventPageStr; ///< JSONを取得するURL
     break;
   case _eventName[2]: ///< フムフム
     url = url + eventName + "/ranking" + eventPageStr;             ///< JSONを取得するURL
     break;
   case _eventName[3]: ///< 対抗戦
   case _eventName[1]: ///< ハンターズ
     url = url + eventName + "/ranking/ajax/user" + eventPageStr;   ///< JSONを取得するURL
     break;
   case _eventName[4]: ///< カリスマ
     url = url + eventName + "/ranking/ajax/paging" + eventPageStr + "&rankingType=1";       ///< JSONを取得するURL
     //rankingType=1 が何を指すのか不明。3まで存在しているが、取れる情報から何をしているかわからない。
     //https://vcard.ameba.jp/championship/ranking/ajax/paging?rankingType=1&page=2
     alert(url);
     break;
   default:
    alert("一致する情報がありません");
    return;
  }
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function( ) {  ///< HTTP アクセス状態変更イベント
    if ( xhr.readyState == 4 && xhr.status == 200) {
      var myArr = JSON.parse(xhr.responseText);

      var array = [];
      if(eventName == _eventName[4]){   ///< カリスマだけ、取得できる情報の内容が異なる
        if(0 < myArr.data.list.length ){
          /// JSONから必要な情報を取得する
          for(element of myArr.data.list ){
            var obj = new Object();
            obj.clubName = element.clubName;      ///< 部活名
            obj.point = element.point;            ///< 獲得ポイント
            obj.rank = element.rank;              ///< 順位
            obj.userId = element.userId;          ///< ユーザID
            obj.userName = element.name;          ///< ユーザ名
            array.push(obj);
          }
        }
      }else{
        if(0 < myArr.data.rankings.list.length ){
          /// JSONから必要な情報を取得する
          for(element of myArr.data.rankings.list ){
            var obj = new Object();
            obj.clubName = element.clubName;      ///< 部活名
            obj.point = element.point;            ///< 獲得ポイント
            obj.rank = element.rank;              ///< 順位
            obj.userId = element.userId;          ///< ユーザID
            obj.userName = element.userName;      ///< ユーザ名
            array.push(obj);
          }
        }
      }
      createRankHTML(array , ranking);
    }
  }

  xhr.open( 'GET', url, true ) ;
  xhr.send( ) ;
}

 /**
  * URLから確認した情報をもとに、表示するための情報をAJAXからJSONで取得する
  * @param eventId      イベントID。各イベントには開始ごとに連番でIDが与えられる
  * @param eventName    イベント名。配列にすべて記載する
  * @param ranking      ユーザに入力された順位
  * @author annie
  * @version 0.1
  */
function getEventParam( url , ranking){
  var urlSprit = url.split(/[\?\/\&]/);  ///< 「?」「/」「&」でURLを分割する。フォルダ名とファイル名、引数で分割される
  var eventName = "";
  var eventId = "";
  for(split of urlSprit){
    if(eventName == ""){
      for(event of _eventName){
        if(split == event){
          eventName = event;
          break;
        }
      }
    }
    if(eventId == ""){
      if(split.indexOf(_eventId) != -1){
        eventId = split.substr(_eventId.length + 1);
      }
    }
  }

  /// カリスマだけ、eventIDが割り当てられない
  if(eventName != "" && ( eventName == _eventName[4] || eventId != "" ) ){
      getDisplayData(eventId , eventName , ranking);
      return true;
  }else{
    /// エラー時の処理
    return false;
  }
}

 /**
  * イベント情報を取得する
  * @param ranking      ユーザに入力された順位
  * @author annie
  * @version 0.1
  */
function getEvent(ranking){
  chrome.tabs.query({}, function (tabs) {    ///< 全タブを取得する
    for (tab of tabs) {
      if(tab.url.indexOf("vcard") != -1){  // URLに「vcard」かつ「eventId」が入っている個所を確認する
        if( getEventParam(tab.url , ranking))
          return;
      }
    }
    /// エラー時の処理
    alert("イベントページが見つかりません。カリスマ以外の場合、URLに\"eventId\"が含まれているかも確認してください");
  });
}

 /**
  * 外部から呼ばれる、順位取得処理を開始する
  * @param ranking      ユーザに入力された順位
  * @author annie
  * @version 0.1
  */
function getRank(ranking) {
  if(ranking < 1 || isNaN(ranking)){  ///< エラーチェック。数値が-1以下、もしくは文字列(数値変換できずNaNになった)場合、処理終了
    alert("1以上の値を入れてください");
    return;
  }
  getEvent(ranking);
}

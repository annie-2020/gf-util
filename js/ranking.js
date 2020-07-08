const _eventName = [ "raid" , "raidwar" , "story" ];  // レイド,ハンターズ,ふむふむ
const _eventId = "eventId";

// 取得した情報から最終結果を表示させる
function createRankHTML(array , ranking) {
  var obj = window.open();
  obj.document.open();
  obj.document.write("<HTML><HEAD><meta charset = utf-8><link rel=\"stylesheet\" href=\"style.css\"></HEAD><BODY>");

  obj.document.write("<H1>" + ranking + "位付近のポイント</H1>");
  obj.document.write("<TABLE border=1><TR><TD>順位</TD><TD>ポイント</TD><TD>ユーザ</TD></TR>\n");

  for (element of array) {   //ガールとギフボで進展可能な情報を出力
    if(ranking == element.rank){
      obj.document.write("<TR><TD class=rankSame>"+ element.rank +"</TD><TD class=rankSame><B>" + element.point + "</B></TD>");
      obj.document.write("<TD class=rankSame><a href=\"https://vcard.ameba.jp/profile?userId=" + element.userId + "\">" + element.userName + "</A></TD></TR>\n");
    }else{
      obj.document.write("<TR><TD class=rank>"+ element.rank +"</TD><TD class=rank><B>" + element.point + "</B></TD>");
      obj.document.write("<TD class=rank><a target=\"_blank\" href=\"https://vcard.ameba.jp/profile?userId=" + element.userId + "\">" + element.userName + "</A></TD></TR>\n");
    }
  }
  obj.document.write("</TABLE></BODY></HTML>");
  obj.document.close();
}

function getDisplayData(eventId , eventName , ranking){
  var pageNum = Math.floor( (ranking + 9) / 10);
  var url = "https://vcard.ameba.jp/" + eventName + "/ajax/ranking-search?eventId=" + eventId + "&page=" + pageNum;

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function( ) {
    if ( xhr.readyState == 4 && xhr.status == 200) {
      var myArr = JSON.parse(xhr.responseText);

      if(0 < myArr.data.rankings.list.length ){
        var array = [];
        for(element of myArr.data.rankings.list ){
          var obj = new Object();
          obj.clubName = element.clubName;
          obj.point = element.point;
          obj.rank = element.rank;
          obj.userId = element.userId;
          obj.userName = element.userName;
          array.push(obj);
        }
        createRankHTML(array , ranking);
      }
    }
  }

  xhr.open( 'GET', url, true ) ;
  xhr.send( ) ;
}

function getEventParam( url , ranking){
  var urlSprit = url.split(/[\?\/]/);
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
  if(eventName != "" && eventId != ""){
    getDisplayData(eventId , eventName , ranking);
  }
}

//イベント情報を取得する
function getEvent(ranking){
  chrome.tabs.query({}, function (tabs) {
    for (tab of tabs) {
      if(tab.url.indexOf("vcard") != -1 && tab.url.indexOf(_eventId) != -1){  // GFのイベント画面
        getEventParam(tab.url , ranking);
        return;
      }
    }
    alert("イベントページが見つかりません。URLに\"eventId\"が含まれているか確認してください");
  });
}

function getRank(ranking) {
  if(ranking < 1 || isNaN(ranking)){
    alert("1以上の値を入れてください");
    return;
  }
  getEvent(ranking);
}

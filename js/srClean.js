 /**
  * SR以上のガールの進展度合いから、卒業可能、進展可能なカードをギフボから見つけ出す
  * @author annie
  * @version 0.1
  */

var cardNameMap = new Map();  ///< ID/NAMEのMAP
var cardGiftMap = new Map();  ///< ID/ギフボ内のカード数のMAP
var cardGirlMap = new Map();  ///< ID/ガール情報のMAP

 /**
  * メンバー変数をクリア
  *
  * @author annie
  * @version 0.1
  */
function clearSRData(){
  cardNameMap = new Map();
  cardGiftMap = new Map();
  cardGirlMap = new Map();
}

 /**
  * 取得した情報から最終結果を表示させる
  *
  * @author annie
  * @version 0.1
  */
function createCardHTML() {
  /// ドキュメント出力開始
  var obj = window.open();
  obj.document.open();
  obj.document.write("<HTML><HEAD><meta charset = utf-8><link rel=\"stylesheet\" href=\"style.css\"></HEAD><BODY>");

  obj.document.write("<H1>ギフボから進展できるかも</H1>");
  obj.document.write("<TABLE border=1><TR><TD colspan=2>手持ちガール</TD><TD colspan=2>ギフボのガール</TD><TD>ギフボ枚数</TD></TR>\n");

  for (let [key, value] of cardGirlMap) {   /// ガールとギフボで進展可能な情報を出力
    if(value.evolId != 0){
      var exTxt = "";
      var exStar = "";
      var girlTag = "<TD class=girl>";
      if(value.limitbreakCount==1){      // EX進展済みの場合
        exStar = "☆";
        exTxt  = "(EX済み)";
        girlTag = "<TD class=girlEx>";
      }
      
      var strRarity = "SR";
      switch(value.rarity){   /// ガールのレアリティを文字列に
      case 4: strRarity = "HR";  break; ///< HR
      case 6: strRarity = "SSR"; break; ///< SSR
      case 7: strRarity = "UR";  break; ///< UR
      default:break;
      }
      var strGiftRarity = "SR";   /// ギフトのレアリティを文字列に
      switch(cardGiftMap.get(value.evolId).rarity){
      case 4: strGiftRarity = "HR";  break; ///< HR
      case 6: strGiftRarity = "SSR"; break; ///< SSR
      case 7: strGiftRarity = "UR";  break; ///< UR
      default:break;
      }

      obj.document.write( "<TR>" + girlTag + strRarity + "</TD>" + girlTag + exStar + cardNameMap.get(key) +
                          "</TD>" + girlTag + strGiftRarity + "</TD>" + girlTag + cardNameMap.get(value.evolId) +
                          "</TD>" + girlTag + exTxt + cardGiftMap.get(value.evolId).count +"枚</TD></TR>\n");
    }
  }
  for (let [key, value] of cardGiftMap) {   //ギフボだけで出力可能な情報を出力
    if(value.count > 1){
      var giftTag = "<TD class=gift>";
      switch(value.count){ /// ギフボ内の数によりテーブルの色を変える
        case 2:
        case 3:
         break;
        case 4:
          giftTag = "<TD class=giftMid>"; break;
        default:
          giftTag = "<TD class=giftMax>"; break;
      }
      var strGiftRarity = "SR";
      switch(value.rarity){   /// ギフトのレアリティを文字列に
        case 4: strGiftRarity = "HR";  break; ///< HR
        case 6: strGiftRarity = "SSR"; break; ///< SSR
        case 7: strGiftRarity = "UR";  break; ///< UR
        default:break;
      }
      obj.document.write( "<TR>" + giftTag + "</TD>"+ giftTag + "ないよ</TD>" + giftTag + strGiftRarity + "</TD>"+ 
                          giftTag + cardNameMap.get(key) + "</TD>" + giftTag + "ギフボに"+ value.count +"枚</TD></TR>\n");
    }
  }
  obj.document.write("</TABLE></BODY></HTML>");
  obj.document.close();
  clearSRData();
}

 /**
  * ガールからメニューで指定したレアリティのカードを取得して、進展可能カードがあるかを確認する
  *
  * 再帰関数もどき。(実際には「XMLHttpRequest」の非同期関数「onreadystatechange」で途切れてる)
  * 処理はとても簡単
  * ・ ギフボのID群(ギフボ内の進展は１かMAXのどちらか)と手持ちカードのIDを比較する
  * ・ 比較は、自身のガールのID(１～３進展)から、進展度合いに応じて0～2を除算し、自身のカードに対する1進展のカードを突き止める
  *
  * @param index ガール内のページインデックス。1から開始
  * @author annie
  * @version 0.1
  */
function getCard(index){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function( ) {
    if ( xhr.readyState == 4 && xhr.status == 200) {                     // 情報取得完了
      var myArr = JSON.parse(xhr.responseText);                          // JSON読み込み
      for(var i = 0 ; i < myArr.data.searchList.length ; ++i){           // 1ページに表示するカードの数(最大10枚)
        if(!cardNameMap.has(myArr.data.searchList[i].cardId)){           // IDと名前のMAPを作成
          cardNameMap.set(myArr.data.searchList[i].cardId , myArr.data.searchList[i].cardName);
        }

        if(!cardGirlMap.has(myArr.data.searchList[i].cardId) ){            /// ガールのカードの情報を取得する
          var card = new Object();
          card.limitbreakCount = myArr.data.searchList[i].limitbreakCount; ///< EX進展。1がEX進展
          card.evolution       = myArr.data.searchList[i].evolution;       ///< 1 1進展 3 最終進展
          card.rarity          = myArr.data.searchList[i].rarity;          ///< RARITY 5:SR、6:SSR、7:UR
          card.evolId          = 0;                                        ///< 進展可能なID

          if(card.evolution == 1){                                         /// カードが1進展の場合。同IDカードがあるかを確認する
            if(cardGiftMap.has(myArr.data.searchList[i].cardId)){
              card.evolId = myArr.data.searchList[i].cardId;
            }
          }else if(card.evolution == 2){                                   /// カードが2進展の場合。ID-1 のIDカードがあるかを確認する
            if(cardGiftMap.has(myArr.data.searchList[i].cardId - 1)){
              card.evolId = myArr.data.searchList[i].cardId - 1;
            }
          }else if(card.evolution == 3){                                   /// カードが最終進展の場合。ID-2 のIDカードがあるかを確認する
            if(cardGiftMap.has(myArr.data.searchList[i].cardId - 2)){
              card.evolId = myArr.data.searchList[i].cardId - 2;
            }
          }
          cardGirlMap.set(myArr.data.searchList[i].cardId , card);
        }else{
          var tmpVal = cardGirlMap.get(myArr.data.searchList[i].cardId);   /// 同一カードをすでに保持している場合。EX進展していない方の情報で更新
          if(tmpVal.limitbreakCount == 1 && myArr.data.searchList[i].limitbreakCount == 0){
            tmpVal.limitbreakCount = 0;
            cardGirlMap.set(myArr.data.searchList[i].cardId , tmpVal);
          }
        }
      }

      if(index*10 < myArr.data.searchCount ){     /// カードがまだ残っている場合、引き続き
        getCard(index+1);
      }else{
        alert("ガール(" + myArr.data.searchCount + ")読み込み完了");
        createCardHTML();
      }
    }
  }

  var strRarity = "";
  if( localStorage["EX-HR"] != "0" ) /// HR指定なら、手持ちからはHR/SRを調べる
    strRarity ="rarities=HIGH_RARE&rarities=S_RARE&";
  if( localStorage["EX-SR"] != "0" ){ /// SR指定なら、手持ちからはSR/SSRを調べる
    if(localStorage["EX-HR"] == "0" ) strRarity = "rarities=S_RARE&";
    strRarity = strRarity + "rarities=SS_RARE&";
  }
  if( localStorage["EX-SSR"]  != "0" ){ /// SSR指定なら、手持ちからはSSR/URを調べる
    if(localStorage["EX-SR"] == "0" ) strRarity = strRarity + "rarities=SS_RARE&";
    strRarity = strRarity + "rarities=U_RARE&";
  }
  /// 手持ちカードから対象を取得する
  /// 「rarities=SS_RARE&rarities=U_RARE&rarities=S_RARE」→ 見た通り
  /// 「sortType=DATETIME&sortDirection=DESC」→日付順、新しいもの順。条件は何でもいいが、ソートしてることが重要。
  var url = 'https://vcard.ameba.jp/card/ajax/card-list-search?userCardListType=GIRLS_PAGE&sortType=DATETIME&sortDirection=DESC&exceptLeaderCard=true&' + strRarity + 'page=' + index;
  xhr.open( 'GET', url, true ) ;
  xhr.send( ) ;
}

 /**
  * ギフボのカードからメニューで指定したレアリティのカードを取得してくる
  *
  * 再帰関数もどき。(実際には「XMLHttpRequest」の非同期関数「onreadystatechange」で途切れてる)
  *
  * @param index ギフボ内のページインデックス。1から開始
  * @author annie
  * @version 0.1
  */
function getGift(index){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function( ) {
    if ( xhr.readyState == 4 && xhr.status == 200) {                        ///< 情報取得完了
      var myArr = JSON.parse(xhr.responseText);                             ///< JSON読み込み
      for(var i = 0 ; i < myArr.data.results.length ; ++i){                 ///< 1ページに表示するカードの数(最大10枚)
        if(!cardGiftMap.has(myArr.data.results[i].typeId)){                 ///< 同一IDのカードの枚数を数える
          var card = new Object();
          card.rarity = myArr.data.results[i].rarity;
          card.count = 1;
          cardGiftMap.set(myArr.data.results[i].typeId , card);
          /// IDと名前のMAPを作成
          cardNameMap.set(myArr.data.results[i].typeId , myArr.data.results[i].name);
        }else{
          var card = cardGiftMap.get(myArr.data.results[i].typeId);
          card.count = card.count + 1;
          cardGiftMap.set(myArr.data.results[i].typeId , card);
        }

        //使っていないパラメータだけど、メモ。
        // myArr.data.results[i].type         // 54= ALL_MAX_CARD_2 , 51=ALL_MAX_CARD , CARD=3
        // myArr.data.results[i].rarity       // 5= SR , 6=SSR
      }

      if(index*10 < myArr.data.searchCount ){ ///< まだ存在する場合、同関数を呼び出す
        getGift(index+1);
      }else{
        if(myArr.data.searchCount > 0){
          alert("ギフトカード(" + myArr.data.searchCount + ")枚読み込み完了");
        }else{
          alert("ギフボに選択レアリティのカードがありません。終了します" );
          return;
        }
        getCard(1);
      }
    }
  }

  var strRarity = "";
  if( localStorage["EX-HR"] != "0" ) strRarity ="4";
  if( localStorage["EX-SR"] != "0" ){
    if(strRarity != "") strRarity = strRarity + "%2c";
    strRarity = strRarity + "5";
  }
  if( localStorage["EX-SSR"] != "0" ){
    if(strRarity != "") strRarity = strRarity + "%2c";
    strRarity = strRarity + "6";
  }

  /// ギフボから「特別指導ガール以外」「レアリティSR,SSR」を対象に検索を実施する(結果はJSON)
  /// 「other=4」→「特別指導ガール以外」、「rarities=5%2c6」→「レアリティSR,SSR」
  var url = 'https://vcard.ameba.jp/giftbox/gift-search?sort=0&other=4&sphere=0&rarities='+ strRarity + '&selectedGift=1&page=' + index;
  xhr.open( 'GET', url, true ) ;
  xhr.send( ) ;
}

 /**
  * 外部から呼ばれる、メニューで指定したレアリティのカードを収集する
  * @author annie
  * @version 0.1
  */
function getSRCards() {
  var strData = "";
  if( localStorage["EX-HR"]  != "0" ) strData = strData + "HR , ";
  if( localStorage["EX-SR"] != "0" ) strData = strData + "SR , ";
  if( localStorage["EX-SSR"]  != "0" ) strData = strData + "SSR";

  if(strData == ""){
     alert("選択されていません。処理を終了します");
     return;
  }

  strData = strData + "のガールの進展可能確認をしますか？";

  if(confirm(strData)){
    clearSRData();
    getGift(1);
  }else{
    alert("処理を終了します");
  }
}

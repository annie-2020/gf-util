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
  obj.document.write("<TABLE border=1><TR><TD>手持ちガール</TD><TD>ギフボのガール</TD><TD>ギフボ枚数</TD></TR>\n");

  for (let [key, value] of cardGirlMap) {   /// ガールとギフボで進展可能な情報を出力
    if(value.evolId != 0){
      var exTxt = "";
      var exStar = "";
      var girlClass = "girl";
      if(value.limitbreakCount==1){      // EX進展済みの場合
        exStar = "☆";
        exTxt  = "(EX済み)";
        girlClass = "girlEx";
      }
       obj.document.write("<TR><TD class=" + girlClass + ">"+ exStar + cardNameMap.get(key) +"</TD><TD class=" + girlClass + ">" + cardNameMap.get(value.evolId) + "</TD>");
       obj.document.write("<TD class=" + girlClass + ">"+ exTxt + cardGiftMap.get(value.evolId) +"枚</TD></TR>\n");
    }
  }
  for (let [key, value] of cardGiftMap) {   //ギフボだけで出力可能な情報を出力
    if(value > 1){
      var giftClass = "gift";
      switch(value){
       case 2:
       case 3:
        break;
       case 4:
        giftClass = "giftMid"; break;
       default:
        giftClass = "giftMax"; break;
      }

      obj.document.write("<TR><TD class=" + giftClass + ">ないよ</TD><TD class=" + giftClass + ">" + cardNameMap.get(key) + "</TD>");
      obj.document.write("<TD class=" + giftClass + ">ギフボに"+ value +"枚</TD></TR>\n");
    }
  }
  obj.document.write("</TABLE></BODY></HTML>");
  obj.document.close();
  clearSRData();
}

 /**
  * ガールからSR/SSR/URを取得して、進展可能カードがあるかを確認する
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

  /// 手持ちカードから対象を取得する
  /// 「rarities=SS_RARE&rarities=U_RARE&rarities=S_RARE」→ 見た通り
  /// 「sortType=DATETIME&sortDirection=DESC」→日付順、新しいもの順。条件は何でもいいが、ソートしてることが重要。
  var url = 'https://vcard.ameba.jp/card/ajax/card-list-search?userCardListType=GIRLS_PAGE&sortType=DATETIME&sortDirection=DESC&exceptLeaderCard=true&rarities=SS_RARE&rarities=U_RARE&rarities=S_RARE&page=' + index;
  xhr.open( 'GET', url, true ) ;
  xhr.send( ) ;
}

 /**
  * ギフボのカードからSR/SSRを取得してくる
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
          cardGiftMap.set(myArr.data.results[i].typeId , 1);
        }else{
          var tmpVal = cardGiftMap.get(myArr.data.results[i].typeId);
          cardGiftMap.set(myArr.data.results[i].typeId , tmpVal+1);
        }

        /// IDと名前のMAPを作成
        if(!cardNameMap.has(myArr.data.results[i].typeId)){
          cardNameMap.set(myArr.data.results[i].typeId , myArr.data.results[i].name);
        }

        //使っていないパラメータだけど、メモ。
        // myArr.data.results[i].type         // 54= ALL_MAX_CARD_2 , 51=ALL_MAX_CARD , CARD=3
        // myArr.data.results[i].rarity       // 5= SR , 6=SSR
      }

      if(index*10 < myArr.data.searchCount ){ ///< まだ存在する場合、同関数を呼び出す
        getGift(index+1);
      }else{
        alert("ギフトカード(" + myArr.data.searchCount + ")枚読み込み完了");
        getCard(1);
      }
    }
  }

  /// ギフボから「特別指導ガール以外」「レアリティSR,SSR」を対象に検索を実施する(結果はJSON)
  /// 「other=4」→「特別指導ガール以外」、「rarities=5%2c6」→「レアリティSR,SSR」
  var url = 'https://vcard.ameba.jp/giftbox/gift-search?sort=0&other=4&sphere=0&rarities=5%2c6&selectedGift=1&page=' + index;
  xhr.open( 'GET', url, true ) ;
  xhr.send( ) ;
}

 /**
  * 外部から呼ばれる、SR以上のカードを収集する
  * @author annie
  * @version 0.1
  */
function getSRCards() {
  clearSRData();
  getGift(1);
}


var cardNameMap = new Map();  // ID/NAMEのMAP
var cardGiftMap = new Map();  // ID/ギフボ内のカード数のMAP
var cardGirlMap = new Map();  // ID/ガール情報のMAP

function clearGlobalData(){
  cardNameMap = new Map();
  cardGiftMap = new Map();
  cardGirlMap = new Map();
}

// 取得した情報から最終結果を表示させる
function createCardHTML() {
  var obj = window.open();
  obj.document.open();
  obj.document.write("<HTML><HEAD><meta charset = utf-8></HEAD><BODY>");

  obj.document.write("<H1>ギフボから進展できるかも</H1>");
  obj.document.write("<TABLE border=1><TR><TD>手持ちのカード</TD><TD>ギフボのカード</TD><TD>ギフボ枚数</TD></TR>\n");

  for (let [key, value] of cardGirlMap) {   //ガールとギフボで進展可能な情報を出力
    if(value.evolId != 0){
      obj.document.write("<TR><TD>"+ cardNameMap.get(key) +"</TD><TD>" + cardNameMap.get(value.evolId) + "</TD>");
      obj.document.write("<TD>"+ cardGiftMap.get(value.evolId) +"枚持ってるよ</TD></TR>\n");
    }
  }
  for (let [key, value] of cardGiftMap) {   //ギフボだけで出力可能な情報を出力
    if(value > 1){
      obj.document.write("<TR><TD>ないよ</TD><TD>" + cardNameMap.get(key) + "</TD>");
      obj.document.write("<TD>ギフボに"+ value +"枚持ってるよ</TD></TR>\n");
    }
  }
  obj.document.write("</TABLE></BODY></HTML>");
  obj.document.close();
  clearGlobalData();
}

//ガールからSR/SSR/URを取得してくる
// 再帰関数。
function getCard(index){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function( ) {
    if ( xhr.readyState == 4 && xhr.status == 200) {                     // 情報取得完了
      var myArr = JSON.parse(xhr.responseText);                          // JSON読み込み
      for(var i = 0 ; i < myArr.data.searchList.length ; ++i){           // 1ページに表示するカードの数(最大10枚)
        if(!cardNameMap.has(myArr.data.searchList[i].cardId)){           // IDと名前のMAPを作成
          cardNameMap.set(myArr.data.searchList[i].cardId , myArr.data.searchList[i].cardName);
        }

        if(!cardGirlMap.has(myArr.data.searchList[i].cardId) ){          // ガールのカードの情報を取得する
          var card = new Object();
          card.limitbreakCount = myArr.data.searchList[i].limitbreakCount; //EX進展
          card.evolution       = myArr.data.searchList[i].evolution;       //1 1進展 3 最終進展
          card.rarity          = myArr.data.searchList[i].rarity;          //RARITY 5:SR、6:SSR、7:UR
          card.evolId          = 0;                                        //進展可能なID

          if(card.evolution == 1){                                         //カードが1進展の場合。同IDカードがあるかを確認する
            if(cardGiftMap.has(myArr.data.searchList[i].cardId)){
              card.evolId = myArr.data.searchList[i].cardId;
            }
          }else if(card.evolution == 2){                                  //カードが2進展の場合。ID-1 のIDカードがあるかを確認する
            if(cardGiftMap.has(myArr.data.searchList[i].cardId - 1)){
              card.evolId = myArr.data.searchList[i].cardId - 1;
            }
          }else if(card.evolution == 3 && card.limitbreakCount == false){ //カードが最終且つEXしてない場合。ID-2 のIDカードがあるかを確認する
            if(cardGiftMap.has(myArr.data.searchList[i].cardId - 2)){
              card.evolId = myArr.data.searchList[i].cardId - 2;
            }
          }
          cardGirlMap.set(myArr.data.searchList[i].cardId , card);
        }else{
          var tmpVal = cardGirlMap.get(myArr.data.searchList[i].cardId);   //同一カードをすでに保持している場合。EX進展していない方の情報で更新
          if(tmpVal.limitbreakCount == 1 && myArr.data.searchList[i].limitbreakCount == 0){
            tmpVal.limitbreakCount = 0;
            cardGirlMap.set(myArr.data.searchList[i].cardId , tmpVal);
          }
        }
      }

      if(index*10 < myArr.data.searchCount ){
        getCard(index+1);
      }else{
        alert("ガール(" + myArr.data.searchCount + ")読み込み完了");
        createCardHTML();
      }
    }
  }

  var url = 'https://vcard.ameba.jp/card/ajax/card-list-search?userCardListType=GIRLS_PAGE&sortType=DATETIME&sortDirection=DESC&exceptLeaderCard=true&rarities=SS_RARE&rarities=U_RARE&rarities=S_RARE&page=' + index;
  xhr.open( 'GET', url, true ) ;
  xhr.send( ) ;
}

//ギフボのカードからSR/SSRを取得してくる
// 再帰関数。
function getGift(index){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function( ) {
    if ( xhr.readyState == 4 && xhr.status == 200) {                        // 情報取得完了
      var myArr = JSON.parse(xhr.responseText);                             // JSON読み込み
      for(var i = 0 ; i < myArr.data.results.length ; ++i){                 // 1ページに表示するカードの数(最大10枚)
        if(!cardGiftMap.has(myArr.data.results[i].typeId)){                 // 同一IDのカードの枚数を数える
          cardGiftMap.set(myArr.data.results[i].typeId , 1);
        }else{
          var tmpVal = cardGiftMap.get(myArr.data.results[i].typeId);
          cardGiftMap.set(myArr.data.results[i].typeId , tmpVal+1);
        }

        if(!cardNameMap.has(myArr.data.results[i].typeId)){                 // IDと名前のMAPを作成
          cardNameMap.set(myArr.data.results[i].typeId , myArr.data.results[i].name);
        }

        // myArr.data.results[i].typeId       // ID
        // myArr.data.results[i].type         // 54= ALL_MAX_CARD_2 , 51=ALL_MAX_CARD , CARD=3
        // myArr.data.results[i].rarity       // 5= SR , 6=SSR
      }

      if(index*10 < myArr.data.searchCount ){ //まだ存在する場合、再帰的に同関数を呼び出す
        getGift(index+1);
      }else{
        alert("ギフトカード(" + myArr.data.searchCount + ")枚読み込み完了");
        getCard(1);
      }
    }
  }

  var url = 'https://vcard.ameba.jp/giftbox/gift-search?sort=0&other=4&sphere=0&rarities=5%2c6&selectedGift=1&page=' + index;
  xhr.open( 'GET', url, true ) ;
  xhr.send( ) ;
}

function getSRCards() {
  clearGlobalData();
  getGift(1);
}

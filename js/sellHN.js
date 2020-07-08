
var cardGiftId = []; //一時的な一意なガールID

function clearGlobalData(){
  cardGiftId = [];
}

function notifyEnd() {
  alert("終了しました");
  clearGlobalData();
}

//指定されたGiftIDを持つカードを卒業させる
function sellCard(){
  var stringData = "";
  for(var i = 0 ; i < cardGiftId.length ; ++i){
    stringData = stringData + cardGiftId[i] + "," ;   //GiftID を URL用文字列に変更
  }

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function( ) {
    if ( xhr.readyState == 4 && xhr.status == 200) {
      var myArr = JSON.parse(xhr.responseText);
      var nextURL= "https://vcard.ameba.jp/card/sell-gift-result?sellGiftCardIds=" + stringData + "&token=" + myArr.token; //卒業実施ページ

      var xhr2 = new XMLHttpRequest();
      xhr2.onreadystatechange = function( ) {
        if ( xhr2.readyState == 4 && xhr2.status == 200) {
          getHNGirl();  //読み込み終わったので、次の実施へ
        }
      }

      xhr2.open( 'GET', nextURL , true );
      xhr2.withCredentials  = true;
      xhr2.send( );

      clearGlobalData();
    }
  }

  var newUrl = 'https://vcard.ameba.jp/card/sell-gift-confirm?sellGiftCardIds=' + stringData;    //卒業用手続きページ

  xhr.open( 'GET', newUrl , true ) ;
  xhr.withCredentials  = true;
  xhr.send( );
}

//HN以下のガールの情報をギフボから出力する
function getHNGirl(){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function( ) {
    if ( xhr.readyState == 4 && xhr.status == 200) {
      var myArr = JSON.parse(xhr.responseText);

      if(0 < myArr.data.searchCount ){
        for(var i = 0 ; i < myArr.data.results.length ; ++i){
          cardGiftId.push(myArr.data.results[i].giftId);       //GIFTID(全カードに一意に振られたID)を保持
        }
        sellCard();  //カードを卒業させる
      }else{
        notifyEnd();
      }
    }
  }

  //ギフボから「特別指導ガール以外」「レアリティN,HN」を対象に検索を実施する(結果はJSON)
  var url = 'https://vcard.ameba.jp/giftbox/gift-search?sort=0&other=4&sphere=0&rarities=1%2c2&selectedGift=1&page=1';
  xhr.open( 'GET', url, true ) ;
  xhr.send( ) ;
}

function sellHNGirl() {
  clearGlobalData();
  alert("sellHNGirl");
  getHNGirl();
}


 /**
  * HN以下のガールを卒業させるスクリプト
  * @author annie
  * @version 0.1
  */


var _checkN   = false;       ///< Nが卒業対象かどうか
var _checkHN  = false;       ///< HNが卒業対象かどうか
var _checkR   = false;       ///< Rが卒業対象かどうか

 /**
  * 終了通知
  * @author annie
  * @version 0.1
  */
function notifyEnd() {
  alert("終了しました");
}

 /**
  * 指定されたGiftIDを持つカードを卒業させる
  *
  * 同一GifT ID配列を2つのURLに渡す
  * 1.卒業させるGIFTIDを確認させる→ここからtokenを取得する
  * 2.tokenとともにGIFTIDを渡し、卒業を実施
  *
  * @param cardGiftId   GiftID配列
  * @author annie
  * @version 0.1
  */
function sellCard(cardGiftId){
  var stringData = "";
  ///GiftID を URL用文字列に変更
  for(var i = 0 ; i < cardGiftId.length ; ++i){
    stringData = stringData + cardGiftId[i] + "," ;
  }

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function( ) {
    if ( xhr.readyState == 4 && xhr.status == 200) {
      var myArr = JSON.parse(xhr.responseText);
      var nextURL= "https://vcard.ameba.jp/card/sell-gift-result?sellGiftCardIds=" + stringData + "&token=" + myArr.token; ///< 卒業実施ページ

      var xhr2 = new XMLHttpRequest();
      /// ここでは、ページを読み込むだけで良い。ページを開くことで、卒業処理が実施される
      xhr2.onreadystatechange = function( ) {
        if ( xhr2.readyState == 4 && xhr2.status == 200) {
          getHNGirl();  //読み込み終わったので、次の実施へ
        }
      }

      xhr2.open( 'GET', nextURL , true );
      xhr2.withCredentials  = true;
      xhr2.send( );
    }
  }

  var newUrl = 'https://vcard.ameba.jp/card/sell-gift-confirm?sellGiftCardIds=' + stringData;    ///< 卒業用手続きページ。tokenを取得するために必要

  xhr.open( 'GET', newUrl , true ) ;
  xhr.withCredentials  = true;
  xhr.send( );
}

 /**
  * HN以下のガールの情報をギフボから出力する
  *
  * @author annie
  * @version 0.1
  */
function getHNGirl(){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function( ) {
    if ( xhr.readyState == 4 && xhr.status == 200) {
      var myArr = JSON.parse(xhr.responseText);
      if(0 < myArr.data.searchCount ){
        var cardGiftId = [];
        for(var i = 0 ; i < myArr.data.results.length ; ++i){
          cardGiftId.push(myArr.data.results[i].giftId);       ///< GIFTID(全カードに一意に振られたID)を保持
        }
        sellCard(cardGiftId);  ///< カードを卒業させる
      }else{
        notifyEnd();
      }
    }
  }

  /// ギフボから「特別指導ガール以外」「レアリティN,HN」を対象に検索を実施する(結果はJSON)
  /// 「other=4」→「特別指導ガール以外」、「rarities=1%2c2」→「レアリティN,HN」
  var strRarity = "";
  if( _checkN ) strRarity = "1";
  if( _checkHN ){
    if(strRarity != "") strRarity = strRarity + "%2c";
    strRarity = strRarity + "2";
  }
  if( _checkR ){
    if(strRarity != "") strRarity = strRarity + "%2c";
    strRarity = strRarity + "3";
  }

  var url = 'https://vcard.ameba.jp/giftbox/gift-search?sort=0&other=4&sphere=0&rarities=' + strRarity + '&selectedGift=1&page=1';
  xhr.open( 'GET', url, true ) ;
  xhr.send( ) ;
}

 /**
  * 外部から呼ばれる、卒業処理を開始する
  * @author annie
  * @version 0.1
  */
function sellHNGirl() {

  // 初期化されていなければ、初期化する
  if(null == localStorage["GRAD-N"])  localStorage["GRAD-N"]  = 1;
  if(null == localStorage["GRAD-HN"]) localStorage["GRAD-HN"] = 1;
  if(null == localStorage["GRAD-R"])  localStorage["GRAD-R"]  = 0;

  //処理中のストレージ変更に対処するため、メンバ変数化
  _checkN   = ( localStorage["GRAD-N"]  != "0" );
  _checkHN  = ( localStorage["GRAD-HN"]  != "0" );
  _checkR   = ( localStorage["GRAD-R"]  != "0" );

  var strData = "";
  if( _checkN )  strData = "N, ";
  if( _checkHN ) strData = strData + "HN, ";
  if( _checkR )  strData = strData + "R";

  if(strData == ""){
     alert("選択されていません。処理を終了します");
     return;
  }

  strData = strData + "のガールを卒業させますか？";

  if(confirm(strData)){
    getHNGirl();
  }else{
    alert("処理を終了します");
  }
}

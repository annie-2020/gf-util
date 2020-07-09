 /**
  * 拡張機能をクリックした際に表示されるページのスクリプト部分
  * @author annie
  * @version 0.1
  */

window.addEventListener('load',()=>{  ///< 拡張機能ポップアップページが読み込まれたとき

    /// SRボタンが押されたとき
    document.querySelector('button.SR').addEventListener('click',()=>{
      var bgWindow = chrome.runtime.getBackgroundPage(function( backgroundPage ){
        backgroundPage.getSRCards();  ///< SR以上のカードの収集
      });
      window.close();
    });

    /// Gradボタンが押されたとき
    document.querySelector('button.Grad').addEventListener('click',()=>{
      var bgWindow = chrome.runtime.getBackgroundPage(function( backgroundPage ){
        backgroundPage.sellHNGirl();  ///< HN以下のギフボのカードを卒業
      });
      window.close();
    });

    /// Rankボタンが押されたとき
    document.querySelector('button.Rank').addEventListener('click',()=>{
      var bgWindow = chrome.runtime.getBackgroundPage(function( backgroundPage ){
        var ranking = 0;
        try{
          ranking = parseInt(document.querySelector('input.rankNum').value);
        } catch(e){
          // 何もしない。ここではalert表示などできないため、
          // Exceptionだけ取得し、Backgroundでエラー処理実施
        }
        backgroundPage.getRank(ranking);  ///< 指定順位を取得する
      });
      window.close();
    });
})
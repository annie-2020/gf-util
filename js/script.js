
window.addEventListener('load',()=>{  // 拡張機能ポップアップページが読み込まれたとき
    document.querySelector('button.SR').addEventListener('click',()=>{  // 
      var bgWindow = chrome.runtime.getBackgroundPage(function( backgroundPage ){
        backgroundPage.getSRCards();  //SR以上のカードの収集
      });
      window.close();
    });
    document.querySelector('button.Grad').addEventListener('click',()=>{
      var bgWindow = chrome.runtime.getBackgroundPage(function( backgroundPage ){
        backgroundPage.sellHNGirl();  //HN以下のギフボのカードを卒業
      });
      window.close();
    });
    document.querySelector('button.Rank').addEventListener('click',()=>{
      var bgWindow = chrome.runtime.getBackgroundPage(function( backgroundPage ){
        var ranking = 0;
        try{
          ranking = parseInt(document.querySelector('input.rankNum').value);
        } catch(e){
          return;
        }
        backgroundPage.getRank(ranking);  //指定順位を取得する
      });
      window.close();
    });
})
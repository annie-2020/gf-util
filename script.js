
window.addEventListener('load',()=>{  // 拡張機能ポップアップページが読み込まれたとき
    document.querySelector('button.SR').addEventListener('click',()=>{  // 
        var bgPage = chrome.extension.getBackgroundPage();
        bgPage.getSRCards();  //SR以上のカードの収集
        window.close();
    });
    document.querySelector('button.Grad').addEventListener('click',()=>{
        var bgPage = chrome.extension.getBackgroundPage();
        bgPage.sellHNGirl();  //HN以下のギフボのカードを卒業
        window.close();
    });
})
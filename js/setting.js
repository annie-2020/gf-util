 /**
  * 各種設定
  * @author annie
  * @version 0.2
  */


 /**
  * 設定画面を開いた際の設定
  * @author annie
  * @version 0.2
  */
window.onload = function(){
    // initialize
    load_setting();

    // set save event
    var btn = document.getElementById("btn-save");
    btn.addEventListener("click", function(){
        save_setting();
    });
}

 /**
  * 設定画面を開いた際の設定詳細
  * @author annie
  * @version 0.2
  */
function load_setting()
{
  { //デフォルト値確認設定
    if(null == localStorage["EX-HR"])   localStorage["EX-HR"]   = 0;
    if(null == localStorage["EX-SR"])   localStorage["EX-SR"]   = 1;
    if(null == localStorage["EX-SSR"])  localStorage["EX-SSR"]  = 1;
    if(null == localStorage["GRAD-N"])  localStorage["GRAD-N"]  = 1;
    if(null == localStorage["GRAD-HN"]) localStorage["GRAD-HN"] = 1;
    if(null == localStorage["GRAD-R"])  localStorage["GRAD-R"]  = 0;
  }

  document.getElementById("EX-HR").checked   = Boolean(parseInt(localStorage["EX-HR"]));
  document.getElementById("EX-SR").checked   = Boolean(parseInt(localStorage["EX-SR"]));
  document.getElementById("EX-SSR").checked  = Boolean(parseInt(localStorage["EX-SSR"]));
  document.getElementById("GRAD-N").checked  = Boolean(parseInt(localStorage["GRAD-N"]));
  document.getElementById("GRAD-HN").checked = Boolean(parseInt(localStorage["GRAD-HN"]));
  document.getElementById("GRAD-R").checked  = Boolean(parseInt(localStorage["GRAD-R"]));
}

 /**
  * 設定保存
  * @author annie
  * @version 0.2
  */
function save_setting()
{
  localStorage["EX-HR"]   = document.getElementById("EX-HR").checked ? 1 : 0;
  localStorage["EX-SR"]   = document.getElementById("EX-SR").checked ? 1 : 0;
  localStorage["EX-SSR"]  = document.getElementById("EX-SSR").checked ? 1 : 0;
  localStorage["GRAD-N"]  = document.getElementById("GRAD-N").checked ? 1 : 0;
  localStorage["GRAD-HN"] = document.getElementById("GRAD-HN").checked ? 1 : 0;
  localStorage["GRAD-R"]  = document.getElementById("GRAD-R").checked ? 1 : 0;
}

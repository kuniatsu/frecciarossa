"use strict";
/*crowler.js内の関数を使用するのに必要*/
const crowler = require('./crowler'); 

(async() => {    
    /*puppeteerのブラウザとpageを作成、pageはブラウザのタブのイメージ*/
    let page = await crowler.makePage();
    
    /*screenShotを撮りたいURLを配列に追加*/
    let urlArray = [
        "https://developer.mozilla.org/ja/docs/Web/API/Element/scrollLeft",
        "https://developer.mozilla.org/ja/docs/Web/API/Element/scrollTop"
    ];
    
    //引数用の値
    var dir = "ss";//screenShotが保存される場所
    var nameArg = "masao";//screeShotファイルのファイル名
    var quality = 80;//画質、80がデフォルト
    var fullsize = true;//trueでページ全体をscreenShot
    var emulateDevices = "iPhone X";//エミュレータ端末
    await crowler.screenShot(page,urlArray,nameArg,dir,emulateDevices,fullsize,quality);

    /*puppeteerのブラウザを終了する*/
    crowler.browserClose();
})();
"use strict";
/*crowler.js内の関数を使用するのに必要*/

const crowler = require('./crowler'); 
// const devices = require('puppeteer/DeviceDescriptors');

(async() => {    
    /*puppeteerのブラウザとpageを作成、pageはブラウザのタブのイメージ*/
    let page = await crowler.makePage();
    
    /*指定したurlを開きセレクターの条件に合うhrefを全て取得*/
    let urlArray = [
        "https://developer.mozilla.org/ja/docs/Web/API/Element/scrollLeft",
        "https://developer.mozilla.org/ja/docs/Web/API/Element/scrollTop"
    ];


//////////////ここから

    //引数
    var dir = "ss";
    var nameArg = "masao";//文字列か配列
    var quality = 80;
    var fullsize = true;
    var emulateDevices = "iPhone X";

    await crowler.screenShot(page,urlArray,nameArg,dir,emulateDevices,fullsize,quality);

    /*puppeteerのブラウザを終了する*/
    crowler.browserClose();
})();
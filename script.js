"use strict";
/*crowler.js内の関数を使用するのに必要*/
const crowler = require('./crowler'); 
/*Tagを指定するためのセレクタ*/ 
const hrefSelector = '#wikiArticle > dl:nth-child(8) > dt > a';

(async() => {
    /*短縮して動かす際に使用、繰り返す回数を制限*/
    // crowler.setTestCount(5);//test                        
    
    /*puppeteerのブラウザとpageを作成、pageはブラウザのタブのイメージ*/
    let page = await crowler.makePage();
    
    /*指定したurlを開きセレクターの条件に合うhrefを全て取得*/
    let shopUrl = await crowler.renderingGetHref(page,'https://developer.mozilla.org/ja/docs/Web/API/Element',hrefSelector);

    /*指定のurlを開きセレクターで指定されている要素のinnerTextを取得する*/
    let method_info = await crowler.renderingScraping(
      page, shopUrl, crowler.renderingGetInnerText,{
        name :'h1',
        description :'#wikiArticle > p',
        syntax :'#wikiArticle > pre.syntaxbox'
    });

    /*puppeteerのブラウザを終了する*/
    crowler.browserClose();
    /*取得したデータをdata.jsonというファイルで保存*/
    crowler.writeFile('sampleData.json', method_info);
})();
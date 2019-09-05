"use strict";
/*crowler.js内の関数を使用するのに必要*/
const crowler = require('./crowler'); 
/*Tagを指定するためのセレクタ*/ 
const hrefSelector = '#wikiArticle > dl:nth-child(8) > dt > a';

(async() => {
    /*短縮して動かす際に使用、繰り返す回数を制限*/
    // crowler.setTestCount(0);//test                        
        
    /*指定したurlを開きセレクターの条件に合うhrefを全て取得*/
    let urlArray = await crowler.getHref('https://developer.mozilla.org/ja/docs/Web/API/Element',hrefSelector);

    /*指定のurlを開きセレクターで指定されている要素のinnerTextを取得する*/
    let MDN_info = await crowler.syncScraping(
      urlArray, crowler.getValue,{
        name :{attribute:'innerText',selector:'h1'},
        description :{attribute:'innerText',selector:'#wikiArticle > p'},
        syntax :{attribute:'innerText',selector:'#wikiArticle > pre.syntaxbox'},
        url:{attribute:'baseURI',selector:'html'}
    });

    /*取得したデータをdata.jsonというファイルで保存*/
    crowler.writeFile('sampleData.json', MDN_info);
})();
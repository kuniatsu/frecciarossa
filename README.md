メジャーなスクレイピングライブラリの   
･cheerio    
･puppeteer    
を頭使わず同じような感じで使おうというものです。  
それぞれ短所長所があるので、場合によって書き方を買えなくていいように、メソッド名を統一しています。

----

```
frecciarossaを使うにはDL先の環境に動作環境に、下記のいずれかが必要です。       
・node.jsがインストールされたターミナル   
・Dockerがインストールされたターミナル      
```

# 目次
･[frecciarossaをDLする](#frecciarossaをDLする)  
･[Node.jsがインストールされた環境で動作させる方法](#Node.jsがインストールされた環境で動作させる方法)  
･[Dockerがインストールされた環境で動作させる方法](#Dockerがインストールされた環境で動作させる方法)  
･[scrapingサンプル](#scrapingサンプル)   
･[関数一覧](#関数一覧)  




# **frecciarossaをDLする**

zipファイルでダウンロード  
<a href="https://github.com/kuniatsu/frecciarossa/archive/master.zip">
  <button>zipでダウンロード</button>
</a>  

GitでDLする方法
> $ git clone https://github.com/kuniatsu/frecciarossa.git

cURLでDLする方法
> $ curl -OL https://github.com/kuniatsu/frecciarossa/archive/master.zip  





# **Node.jsがインストールされた環境で動作させる方法**
## Node.jsのinstall確認
> $ node -V  
※versionが表示されればinstallされている。

## 必要パッケージをNPMでinstallする  
> $ npm install   
※package.jsonがあるフォルダで実施すること   

## scriptを実行する   
> $ node script.js    
※node [動作させたいscript]  




# **Dockerがインストールされた環境で動作させる方法**
## Dockerのinstall確認
> $ sudo docker -v  
※versionが表示されればinstallされている。

## Dockerのimage確認
> $ sudo docker images   

※Dockerアプリなどのserviceが立ち上がっている事  
※コマンドで立ち上げる場合は`service docker start`で立ちがる

## Dockerのcontainer確認
> $ sudo docker ps -a

## Dockerfileからimageを作成する
> $ sudo docker build -t crowler/scraping .  
※sudo docker build -t [imageの名前] [作成場所] 

## imageからcontainerを作成しbashで操作する
> $ sudo docker run -it --name crowler crowler/scraping /bin/bash  
※$ sudo docker run -it --name [containerの名前] [imageの名前] /bin/bash 

## 再びcontainerをスタートさせる
> $ sudo docker start -a 83d    
※ sudo docker start [option] [container_id]    
※ -a はattachを同時に行うもの  
※ 起動中ではないcontainer向け(docker ps -aで表示されるが、dockr psでは表示されないcontainer)

## 起動中のcontainerに入る
> $ sudo docker attach 83d  
※ sudo docker attach [container_id]  
※ 起動のcontainer向け(dockr psで表示されるcontainer)

## 起動中のcontainerからファイルをコピーする
> bash-4.2# ls ...コピーしたいファイルがあるかを調べる   
> bash-4.2# pwd ...場所を調べる   
> bash-4.2# exit ...でる   
> $ sudo docker ps ...コピー元が起動していることの確認とIDの確認    
> $ sudo docker cp [container_id]:/dir/file.json file.json    
※ 例：sudo docker cp 6a98d87871e3:/scraping/jtb.json jtb.json  
※containerが起動してない場合はdocker startする必要がある。  

## containerを止める
> $ sudo docker stop crowler  
※ sudo docker stop [containerの名前 | containerのID]  


## containerを削除する
> $ sudo docker rm crowler  
※ sudo docker rm [containerの名前 | containerのID]  

## imageを削除する
> $ sudo docker rmi crowler/scraping  
※ sudo docker rm [imageの名前 | imageのID]



<br>

## **Dockerfileの詳細**

```md:Dockerfile  
FROM amazonlinux              ・・・FROMで基のimageを選択(使用するOSなどを指定)  
MAINTAINER kunishima          ・・・作成者  
RUN echo "now building..."    ・・・RUNはbuild時に実行  
RUN curl --silent --location https://rpm.nodesource.com/setup_8.x 
  | bash -                    ・・・rpmでnodeをDL  
RUN set -ex; \
        yum -y update; \
        yum -y install \
            vim \
            nodejs \
            libX11 \
            libXcomposite \ 
            libXcursor \v
            libXdamage \
            libXext \
            libXi \
            libXtst \
            cups-libs \
            libXScrnSaver \
            libXrandr \
            alsa-lib \
            pango \
            atk \
            at-spi2-atk \
            gtk3
RUN node -v
COPY ./his.js .               ・・・環境にcopyする
RUN npm install  puppeteer    ・・・chromeを自動化するlibrary
CMD ["echo","now runing..."]  ・・・CMDはrun時に実行  
```
<br><br><br><br><br><br>


# **scrapingサンプル**

ヘッドレスブラウザを使用しScraping
```Javascript
"use strict";
/*crowler.js内の関数を使用するのに必要*/
const crowler = require('./crowler'); 
/*Tagを指定するためのセレクタ*/ 
const hrefSelector = '#wikiArticle > dl:nth-child(8) > dt > a';

(async() => {
    /*短縮して動かす際に使用、繰り返す回数を制限*/
    // crowler.setTestCount(0);//test                        
    
    /*puppeteerのブラウザとpageを作成、pageはブラウザのタブのイメージ*/
    let page = await crowler.makePage(false);
    
    /*指定したurlを開きセレクターの条件に合うhrefを全て取得*/
    let urlArray = await crowler.renderingGetHref(page,'https://developer.mozilla.org/ja/docs/Web/API/Element',hrefSelector);

    /*指定のurlを開きセレクターで指定されている要素のinnerTextを取得する*/
    let MDN_info = await crowler.renderingScraping(
      page, urlArray, crowler.renderingGetValue,{
        name :{attribute:'innerText',selector:'h1'},
        description :{attribute:'innerText',selector:'#wikiArticle > p'},
        syntax :{attribute:'innerText',selector:'#wikiArticle > pre.syntaxbox'},
        url:{attribute:'baseURI',selector:'html'}
    });

    /*puppeteerのブラウザを終了する*/
    crowler.browserClose();
    /*取得したデータをdata.jsonというファイルで保存*/
    crowler.writeFile('sampleData.json', MDN_info);
})();
```

同期通信でScraping
```Javascript
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
```


非同期通信でScraping
```Javascript
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
    let MDN_info = await crowler.asyncScraping(
      urlArray, crowler.getValue,{
        name :{attribute:'innerText',selector:'h1'},
        description :{attribute:'innerText',selector:'#wikiArticle > p'},
        syntax :{attribute:'innerText',selector:'#wikiArticle > pre.syntaxbox'},
        url:{attribute:'baseURI',selector:'html'}
    });

    /*取得したデータをdata.jsonというファイルで保存*/
    crowler.writeFile('sampleData.json', MDN_info);
})();
```

指定したURLのページをスクリーンショットで撮る
```Javascript
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
```




# **関数一覧**

|関数  |type  |内容  |  
|---|---|---|  
|[crowler.setTestCount](#setTestCount)| |renderingScraping・syncScraping・asyncScrapingの実行回数を設定する。|  
|[crowler.getTestCount](#getTestCount)| |renderingScraping・syncScraping・asyncScrapingの実行回数を取得する。|  
|[crowler.chackTestCount](#chackTestCount)| |テスト動作時にループ回数を判定する|  
|[crowler.getClient](#getClient)|`cheerio`|cheerio-httpcliのオブジェクトを取得するgetter|
|[crowler.makePage](#makePage)|`Puppeteer`|Puppeteerのbrowserを立ち上げる、pageオブジェクトを作成する|
|[crowler.makePageBasic](#makePageBasic)|`Puppeteer`|Puppeteerのbrowserを立ち上げる、pageオブジェクトを作成する、Basic認証機能付き|
|[crowler.pageClick](#pageClick)|`Puppeteer`|puppeteerのpageオブジェクトでclickする|
|[crowler.browserClose](#browserClose)|`Puppeteer`|puppeteerのbrowserを閉じる|
|[crowler.renderingGetHref](#renderingGetHref)|`Puppeteer`|pageオブジェクト内のhrefを収集する|
|[crowler.getHref](#getHref)| |指定された画面のhrefを収集する(非推奨)|
|[crowler.getHrefFromUrl](#getHrefFromUrl)| |urlで指定された画面のhrefを収集する|
|[crowler.getHrefFromDom](#getHrefFromDom)| |domでわたされた画面のhrefを収集する|
|[crowler.getHrefs](#getHrefs)| |urlで指定された画面のhrefを複数のselectorで探し取得する|
|[crowler.renderingGetValue](#renderingGetValue)|`Puppeteer`|urlで指定された画面の値を収集する|
|[crowler.getValue](#getValue)|`cheerio`|urlで指定された画面の値を収集する|
|[crowler.renderingGetInnerText](#renderingGetInnerText)|`Puppeteer`|pageオブジェクトの値を収集する|v
|[crowler.getInnerText](#getInnerText)|`cheerio`|指定された画面の値を収集する|
|[crowler.renderingScraping](#renderingScraping)|`Puppeteer`|レンダリングされたページに対して繰り返しscraping関数を呼び出す|
|[crowler.syncScraping](#syncScraping)| |URLに対して繰り返しscraping関数を呼び出す|
|[crowler.asyncScraping](#asyncScraping)| |URLに対して非同期で繰り返しscraping関数を呼び出す|
|[crowler.writeFile](#writeFile)| |データをファイルを書き出す|
|[crowler.getEncodeURI](#getEncodeURI)| |日本語URLをUTF-8URLに変換する|
|[crowler.analysisDom](#analysisDom)|`cheerio`|htmlを文字列で受け取りselectorで指定した情報を返す|
|[crowler.screenShot](#screenShot)|`Puppeteer`|配列でURLを渡したサイトのスクリーンショットを作成する|
|[page.goto](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-pagegotourl-options)  |`Puppeteer`|pageを指定のURLへ移動  |
|[page.click](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-pageclickselector-options){:target="_blank"}  |`Puppeteer`|selectorでpageの指定した要素をclick  |
|[page.waitFor](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-pagewaitforselectororfunctionortimeout-options-args){:target="_blank"}  |`Puppeteer`|指定した秒数待つ  |
|[page.$eval](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-pageevalselector-pagefunction-args-1){:target="_blank"}  |`Puppeteer`|selectorでpage内の指定した要素を取得  |
|[page.$$eval](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-pageevalselector-pagefunction-args){:target="_blank"}  |`Puppeteer`|selectorでpage内の指定した要素を全て取得  |
|[page.screenshot](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-pagescreenshotoptions){:target="_blank"}|`Puppeteer`|pageのスクリーンショットを作成  |



# <a name="setTestCount">crowler.setTestCount</a>
> setTestCount(count)   

-引数:count・・・renderingScraping・syncScraping・asyncScrapingの実行回数上限を指定する。  
-戻り値:なし

テストとして動作させる際に使用する。

# <a name="getTestCount">crowler.getTestCount</a>  
> getTestCount()     

-戻り値:setTestCountで設定した値  

setTestCountで設定した値を返却する。  

# <a name="chackTestCount">crowler.chackTestCount</a>  
> getTestCount(num)     

-引数:num・・・testCountと比較する数値を渡す    
-戻り値:引数よりtestCountが低い数値ならtrueを返す   

指定した数値よりしたらなtrueループなどに使う     


# <a name="getClient">crowler.getClient</a>  
> getClient()     

-戻り値:cheerio-httpcliのオブジェクト    

cheerio-httpcliのオブジェクトを取得     







# <a name="makePage">crowler.makePage</a>
> makePage(url=null) 

-引数:url・・・pageオブジェクトで開くURL   
-戻り値:Promise(page) ・・・puppeteerのpageオブジェクトを返す

pugeオブジェクトを作成する際に使用する。

# <a name="pageClick">crowler.pageClick</a>
> pageClick(page,clickSelector,waitTime)

-引数:page・・・使用するpageオブジェクト  
-引数:clickSelector・・・クリック対象のセレクター、セレクターは必ず一意の要素を指定すること   
-引数:waitTime・・・クリック後の待ち時間をミリ秒で指定   
-戻り値:Promise(page)

pageオブジェクトで開いているURLページ内の要素をclickする。   
クリックする対象はclickSelectorで指定する。

# <a name="browserClose">crowler.browserClose</a>
> browserClose()  

-引数:なし  
-戻り値:なし
-メモ:puppeteerのbrowserを終了する

puppeteerを使用する際は最後にbrowserオブジェクトをcloseする必要がある。
作成はmakePageで行われている。

# <a name="renderingGetHref">crowler.renderingGetHref</a>
> renderingGetHref(page,url,selector)  

-引数:page・・・使用するpageオブジェクト   
-引数:url・・・pageオブジェクトで開くURL   
-引数:selector・・・取得対象のaタグを指定するセレクター  
-戻り値:Promise(String[])・・・urlで指定されたページ内からselectorの対象になるaタグのhrefを取得し配列にする

リンクを取得するための関数

# <a name="getHref">crowler.getHref</a>
> getHref(url,selector)  

-引数:url・・・対象ページのURL   
-引数:selector・・・取得対象のaタグを指定するセレクター    
-戻り値:Promise(String[])・・・urlで指定されたページ内からselectorの対象になるaタグのhrefを取得し配列にする

リンクを取得するための関数、通信のみを行いレンダリングをしないためcrowler.renderingGetHrefより高速

# <a name="renderingGetInnerText">crowler.renderingGetInnerText</a>
> renderingGetInnerText(page,url,selectorObj)

-引数:page・・・使用するpageオブジェクト   
-引数:url・・・pageオブジェクトで開くURL    
-引数:selectorObj・・・keyに戻り値のkeyを指定し、valueに対象ページの一意の要素セレクターを指定    
-戻り値:Promise([{key:value}])・・・引数urlのページからkeyにselectObjのkey、valueにselectObjのvalueにで渡されたセレクターが指す要素のinnerTextを返す

指定のページから指定のinnerTextをScrapingする


# <a name="getInnerText">crowler.getInnerText</a>
> getInnerText(url,selectorObj)

-引数:url・・・対象ページのURL 
-引数:selectorObj・・・keyに戻り値のJSONのkeyを指定し、valueに対象ページの一意の要素セレクターを指定   
-戻り値:Promise([{key:value}])・・・引数urlのページからkeyにselectObjのkey、valueにselectObjのvalueに渡されたセレクターが指す要素のinnerTextを返す

指定のページから、指定のinnerTextをScrapingする

# <a name="renderingScraping">crowler.renderingScraping</a>
> renderingScraping(page,urllist,callback,selector)

-引数:page・・・使用するpageオブジェクト   
-引数:urllist・・・Scrapingをする対象のURLリスト       
-引数:callback・・・Scrapingを実施する関数を指定主にrenderingGetInnerTextかrenderingGetHrefを渡す   
-引数:selector・・・keyに戻り値のオブジェクトでkeyにする名前、valueに対象ページの一意の要素セレクターを指定    
-戻り値:Promise([{key:value}])・・・callbackの関数をから返される値を返す

Scrapingを連続して行うために使用する

# <a name="syncScraping">crowler.syncScraping</a>
> syncScraping(urllist,callback,selector)

-引数:urllist・・・Scrapingをする対象のURLリスト       
-引数:callback・・・Scrapingを実施する関数を指定、主にgetInnerTextかgetHrefを渡す   
-引数:selector・・・keyに戻り値のオブジェクトでkeyにする名前、valueに対象ページの一意の要素セレクターを指定    
-戻り値:Promise([{key:value}])・・・callbackの関数をから返される値を返す

Scrapingを連続して行うために使用する、レンダリングを行わず通信のみするため高速

# <a name="asyncScraping">crowler.asyncScraping</a>
> asyncScraping(urllist,callback,selector)

-引数:urllist・・・Scrapingをする対象のURLリスト       
-引数:callback・・・Scrapingを実施する関数を指定主にgetInnerTextかgetHrefを渡す   
-引数:selector・・・keyに戻り値のオブジェクトでkeyにする名前、valueに対象ページの一意の要素セレクターを指定    
-戻り値:Promise([{key:value}])・・・callbackの関数をから返される値を返す

Scrapingを連続して行うために使用する、非同期で複数のURLにアクセスをするためより高速、数が多いとTimeOutする率が上がる

# <a name="writeFile">crowler.writeFile</a>
> writeFile(name,data)

-引数:name・・・保存するファイル名  
-引数:data・・・保存するデータ  
-戻り値:なし

取得したオブジェクトをJSONで書き出すのに使用する

# <a name="getEncodeURI">crowler.getEncodeURI</a>
> getEncodeURI(url)

-引数:url・・・日本語の入ったURL  
-戻り値:String・・・変換したURL

日本語URLの場合うまく動作しなくなることを解決する


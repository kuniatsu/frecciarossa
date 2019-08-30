const client = require('cheerio-httpcli');
const cheerio = require('cheerio');
const URL = require('url');
const fs = require("fs");
const puppeteer = require('puppeteer');
// const chromeArgs = ['--no-sandbox','--disable-setuid-sandbox'];
// puppeteer.launch({headless: false});//確認できる状態でscrapingを行う


var testnum = Number.MAX_SAFE_INTEGER;
var browser = null;

//テスト回数の指定し設定する
exports.setTestCount = (count)=>{
    testnum = count;
}

//テスト回数の取得する
exports.getTestCount = ()=>{
    return testnum;
}

//テスト動作時にループ回数を判定する
exports.chackTestCount = (num)=>{
    return testnum <= num;
}

//cheerio-httpcliのオブジェクトを取得する
exports.getClient = ()=>{
    return client;
}

//Puppeteerのpage作成
exports.makePage = async(url=null)=>{
    if(browser === null){
        console.log('make browser');
        //browser = await puppeteer.launch({args: chromeArgs});
        browser = await puppeteer.launch({headless: false});

    }
    let page = await browser.newPage();
    if(url!=null){
        console.log("goto");
        await page.goto(url, {waitUntil: "networkidle2"});
    }
    return page;
}

//Puppeteerのpage作成(ベーシック認証あり)
exports.makePageBasic = async(url=null,user,pass)=>{
    if(browser === null){
        console.log('make browser');
        //browser = await puppeteer.launch({args: chromeArgs});
        browser = await puppeteer.launch({headless: true});

    }
    let page = await browser.newPage();
    if(url!=null){
        console.log("goto");
        await page.setExtraHTTPHeaders({
            Authorization: `Basic ${new Buffer(`${user}:${pass}`).toString('base64')}`
          });
        await page.goto(url, {waitUntil: "networkidle2"});
    }
    return page;
}

//puppeteerのpageでclickをする
exports.pageClick = async (page,clickSelector,waitTime)=>{
    await page.click(clickSelector);
    await page.waitFor(waitTime);
    return page;
}

//puppeteerのbrowserを閉じる
exports.browserClose = ()=>{
    console.log('end browser');
    browser.close();
}

//urlで指定された画面のhrefを収集する
exports.renderingGetHref = async (page,url,selector)=>{
    await page.goto(url, {waitUntil: "networkidle2"}).catch(() => null);
    return await page.$$eval(selector, list => list.map(data => data.href)).catch(() => null);
}
exports.getHref = async (url,shopSelector)=>{
    let ataDataArray = [];
    let result = await client.fetch(url, {}).catch(()=>"error");
    let anchor = result.$(shopSelector);
    anchor.each((i)=>{
        ataDataArray.push(URL.resolve(url, anchor[i]['attribs']['href']));
    });
    return ataDataArray;
}
exports.getHrefFromUrl = async (url,shopSelector)=>{
    let ataDataArray = [];
    let result = await client.fetch(url, {}).catch(()=>"error");
    let anchor = result.$(shopSelector);
    anchor.each((i)=>{
        ataDataArray.push(URL.resolve(url, anchor[i]['attribs']['href']));
    });
    return ataDataArray;
}

//domでわたされた画面のhrefを収集する
exports.getHrefFromDom = async (dom,baseUrl,shopSelector)=>{
    let ataDataArray = [];
    let anchor = dom.$(shopSelector);
    anchor.each((i)=>{
        let href = URL.resolve(baseUrl, anchor[i]['attribs']['href']);
        console.log("getHrefFromDom:"+href);
        ataDataArray.push(href);
    });
    return ataDataArray;
}

//urlで指定された画面のhrefを複数のselectorで探し取得する
exports.getHrefs = async (url,selectorList)=>{
    let returnArray = [];
    let result = await client.fetch(url, {}).catch(()=>"error");
    for (const selector of selectorList) {    
        let ataDataArray = [];
        let anchor = result.$(selector);
        anchor.each((i)=>{
            ataDataArray.push(URL.resolve(url, anchor[i]['attribs']['href']));
        });
        returnArray.push(ataDataArray);
    }
    return returnArray;
}

//指定された画面の値を収集する
exports.renderingGetInnerText = async (page,url,selectorObj)=>{
    await page.goto(url, {waitUntil: "networkidle2"}).catch(()=>null);
    let array = [];
    let obj = {};
    for(let key in selectorObj){
        obj[key] = await renderingGetSelectorText(page,selectorObj[key]).catch(()=>null);
    }
    array.push(obj);
    return array;
}
exports.getInnerText = async (url,selectorObj)=>{
    let cheerioDom = await client.fetch(url, {}).catch(()=>{});
    let array = [];
    let obj = {};
    for(let key in selectorObj){
        obj[key] = await getSelectorText(cheerioDom,selectorObj[key]).catch(()=>null);
    }
    array.push(obj);
    return array;
}

//urlで指定された画面の値を収集する
exports.getValue = async (url,selectorObj)=>{
    let cheerioDom = await client.fetch(url, {}).catch(()=>{});
    let array = [];
    let obj = {};
    for(let key in selectorObj){
        obj[key] = await getSelectorValue(cheerioDom,selectorObj[key]).catch(()=>null);
    }
    array.push(obj);
    return array;
}

/* 新規追加 内部でも使うからダメかも*/  
exports.getSelectorValue = async (cheerioDom,targetObj)=>{
    let value;
    let dom = cheerioDom.$(targetObj.selector);
    if(targetObj.attribute == "text" || targetObj.attribute == "innerText"){
        value = dom.text();
    }else if(targetObj.attribute == "html" || targetObj.attribute == "innerHtml"){
        value = dom.html();
    }else{
        value = dom.attr(targetObj.attribute);
    }
    if(!value){
        value = "__nothing";
    }
    return value;
};



const renderingGetSelectorText = async (page,selector)=>{
    if(selector){
        return await page.$eval(selector, tag => tag.innerText);
    }
    return null;
};
const getSelectorText = async (cheerioDom,selector)=>{
    let dom = cheerioDom.$(selector);
    return dom.text();
};



//繰り返し関数を呼び出す
exports.renderingScraping = async (page,urllist,callback,selector)=>{
    let valueList = [];
    for(let url of urllist){
        console.log(valueList.length +":"+ url);
        valueList.push(...await callback(page,url,selector));
        if(valueList.length>=testnum)break;//test
    }
    return valueList;
}
exports.syncScraping = async (urllist,callback,selector)=>{
    let valueList = [];
    for(let url of urllist){
        console.log(valueList.length +":"+ url);
        valueList.push(...await callback(url,selector));
        if(valueList.length>=testnum)break;//test
    }
    return valueList;
}
exports.asyncScraping = async (urllist,callback,selector)=>{
    let valueList = [];
    let promiseArray = [];
    for(let url of urllist){
        console.log(promiseArray.length +":"+ url);
        promiseArray.push(callback(url,selector));
        if(promiseArray.length>=testnum)break;//test
    }
    await Promise.all(promiseArray).then((array)=>{
        array.forEach((ele)=>{
            valueList.push(...ele);
        });
    });
    return valueList;
}


//ファイルに書き出す
exports.writeFile = (name,data)=>{
    fs.writeFile(name, JSON.stringify(data),(err)=>{
        if(err){console.log('weiteFile error:'+err)};
    });
}


//日本語URLをUTF-8URLに変換する
exports.getEncodeURI = (url)=>{
    let urlArray = url.split('/');
    let encodeUrl = urlArray[0];
    urlArray.shift();
    urlArray.forEach((str)=>{
        encodeUrl+="/"+encodeURIComponent(str);
    });
    return encodeUrl;
}

/* 新規追加 */
//htmlを文字列で受け取りselectorで指定した情報を返す
exports.analysisDom = (text,selector)=>{
    var cheerioDom = cheerio.load(text);
    return cheerioDom(selector).text;
}



function setUrlData(url) {
    console.log(" Setting url " + url);

    if (!url) {
        console.log("Invalid data %s", url);
        return;
    }

    chrome.storage.sync.get([url], function (res) {
        if (url in res) {

            res[url]["date"].push(new Date().getTime());
            res[url]["amount"] = res[url]["date"].length;

            chrome.storage.sync.set(res, function () {
                console.log("Old  Url set: " + url + " value: " + res[url]["amount"]);
            });
        } else {
            var data = {};
            var date = new Date().getTime();

            data[url] = {
                amount: 1,
                date: [date]
            };

            chrome.storage.sync.set(data, function () {
                console.log("New set: " + url + " value: " + JSON.stringify(data[url]));
            });
        }
    })
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log('Tab Updated');

    if (changeInfo.url) {
        setUrlData(changeInfo.url);
        getLastDayDataAboutUrl(changeInfo.url);
    }

    if (changeInfo.status === 'loading') {
        console.log('starting content script injection')
        injectContentScript(tab);
    }


});

chrome.tabs.onActivated.addListener(function (info) {
    var tab = chrome.tabs.get(info.tabId, function (tab) {
        //get current tab without any selectors
        console.log(" Tab activated with url " + tab.url);
        var url = domainFromUrl(tab.url)
        console.log("url:" + url);
        setUrlData(url);
        getLastDayDataAboutUrl(tab.url);
    });

});

function domainFromUrl(url) {
    var result;
    var match;

    if (match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im)) {
        result = match[1]
        if (match = result.match(/^[^\.]+\.(.+\..+)$/)) {
            result = match[1]
        }
    }
    return result
}

function getLastDayDataAboutUrl(url) {
    console.log("GET LAST DATA CALLED");
    if (!url) {
        console.log("Invalid url " + url);
        return;
    }

    url = domainFromUrl(url);

    chrome.storage.sync.get([url], function (res) {
        if (!res) {
            return;
        }
        var cuurentDate = new Date();
        //todo cuurentDate.setHours(cuurentDate.getHours() - 24);
        cuurentDate.setHours(cuurentDate.getSeconds() - 1);
        var allDates = res[url]["date"];

        var response = [];

        allDates.forEach(function (item, index) {

            console.log(item - cuurentDate.getTime());

            if (item > cuurentDate.getTime()) {
                response.push(item);
            }

        });

        console.log("get data called with %s res: %s", url, response.length);
    });

}

chrome.runtime.onMessageExternal.addListener(
    function (request, sender, sendResponse) {

        chrome.storage.sync.get(null,
            result => {
                if (!result) {
                    sendResponse({response: "no data"});
                    return;
                }

                console.log("All data retrieved " + JSON.stringify(result));
                let keys = Object.keys(result);
                console.log("All keys: " + keys);
                let response = {};
                for (let prop in result) {
                    if (Object.prototype.hasOwnProperty.call(result, prop)) {
                        response[prop] = result[prop]["amount"];
                    }
                }

                sendResponse(response);

            })

    });

function test() {
    chrome.storage.sync.get(null,
        result => {
            let keys = Object.keys(result);
            console.log("All keys: " + keys);
            let response = {};
            for (let prop in result) {
                if (Object.prototype.hasOwnProperty.call(result, prop)) {
                    response[prop] = result[prop]["amount"];
                }
            }

            console.log("Response to send " + JSON
                .stringify(response));
        })
}

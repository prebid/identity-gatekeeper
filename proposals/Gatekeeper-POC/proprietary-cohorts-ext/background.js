function setUrlData(url) {
    console.log(" Setting url " + url);

    if (!url) {
        console.log("Invalid data %s", url);
        return;
    }

    chrome.storage.local.get([url], function (res) {
        if (url in res) {

            res[url]["date"].push(new Date().getTime());
            res[url]["amount"] = res[url]["date"].length;

            chrome.storage.local.set(res, function () {
                console.log("Old  Url set: " + url + " value: " + res[url]["amount"]);
            });
        } else {
            var data = {};
            var date = new Date().getTime();

            data[url] = {
                amount: 1,
                date: [date]
            };

            chrome.storage.local.set(data, function () {
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
});

chrome.tabs.onActivated.addListener(function (info) {
    var tab = chrome.tabs.get(info.tabId, function (tab) {
        //get current tab without any selectors
        console.log(" Tab activated with url " + tab.url);
        var url = getDomain(tab.url)
        console.log("url:" + url);
        setUrlData(url);
        getLastDayDataAboutUrl(tab.url);
    });

});

function getDomain(url) {
    const parsed = new URL(url);
    return parsed.hostname;
}

function getLastDayDataAboutUrl(url) {
    if (!url) {
        console.log("Invalid url " + url);
        return;
    }

    url = getDomain(url);

    chrome.storage.local.get([url], function (res) {
        if (!res) {
            return;
        }
        var curentDate = new Date();
        curentDate.setHours(curentDate.getHours() - 24);
        var allDates = res[url]["date"];

        var response = [];

        allDates.forEach(function (item, index) {
            if (item > curentDate.getTime()) {
                response.push(item);
            }

        });

        console.log("get data called with %s res: %s", url, response.length);
    });

}

function getHistoryFromStorage(sendResponse) {
    chrome.storage.local.get(null, result => {
        if (!result) {
            sendResponse({});
            return;
        }
        const history = {};
        Object.entries(result).forEach(entry => {
            history[entry[0]] = entry[1]["amount"];
        })
        sendResponse(history);
    });
}

chrome.runtime.onMessageExternal.addListener(
    function (request, sender, sendResponse) {
        getHistoryFromStorage(sendResponse);
    });

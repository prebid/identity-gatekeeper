var SESSIONID_URL = 'http://ec2-34-209-240-19.us-west-2.compute.amazonaws.com:8000/api/v1/cohort/';

const interval = setInterval(function () {
    console.log("The session id is reset ");
    resettingSessionId();
}, 18000000);

function resettingSessionId() {
    makeIdRequest(function (data) {
        var obj = JSON.parse(data);
        setGateKeeperStorage(obj.session_id);
    });
}

function setSessionIdStorage(sid) {
    console.log(" Setting session id" + sid);
    var sessionIdData = {}
    sessionIdData.sid = sid
    chrome.storage.sync.set({"GatekeeperId": sessionIdData}, function () {
        console.log(" Gatekeeper data: " + sessionIdData);
    });
}

function setCohortStorage(cohort, score) {
    console.log(" Setting cohort" + cohort);
    var cohortData = {};
    cohortData.cohort = cohort;
    cohortData.score = score;

    chrome.storage.sync.set({"Cohort": cohortData}, function () {
        console.log(" Cohort to storage: " + cohortData);
    });
}

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

function makeIdRequest(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', SESSIONID_URL);
    xhr.addEventListener('load', function (e) {
        var result = xhr.responseText;
        callback(result);
    });
    xhr.send();
}

function postRequest(uri, sid) {
    console.log(" uri " + uri);
    if (uri.includes("?")) {
        uri = uri.substring(0, uri.indexOf('?'));
    }
    console.log("Posted uri" + uri);

    if (uri.length > 0) {
        var sessionid = "";

        if (sid !== undefined && !isEmptyObject(sid)) {
            sessionid = sid.GatekeeperId.sid;
        }

        console.log(" Posting Request to sync the domain " + uri + " and session Id " + sessionid);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", SESSIONID_URL, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify({"domain": uri, "session_id": sessionid}));
        xhr.onreadystatechange = function () { // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                console.log("Got response 200!");
                var json = JSON.parse(xhr.responseText);
                console.log(" Response " + json)
                setSessionIdStorage(json.session_id);
                setCohortStorage(json.cohort, json.c_score);
            }
        }
    }
}

function ValidateSessionAndPost(uri) {

    if (!isValidURL(uri)) {
        console.log("Invalid uri" + uri);
        return;
    }
    chrome.storage.sync.get('GatekeeperId', function (obj) {
        console.log('GatekeeperId', obj.GatekeeperId);
        postRequest(uri, obj);
    });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log('Tab Updated');

    if (changeInfo.url) {
        ValidateSessionAndPost(changeInfo.url);
        setUrlData(changeInfo.url);
        getLastDayDataAboutUrl(changeInfo.url);
    }

    if (changeInfo.status === 'loading') {
        console.log('starting content script injection')
        injectContentScript(tab);
    }


});

chrome.tabs.onCreated.addListener(function (tabId) {

    chrome.tabs.getSelected(null, function (tab) {
        //get current tab without any selectors
        console.log(" Tab created with url " + tab.url);
        ValidateSessionAndPost(tab.url);
    });

});

chrome.tabs.onActivated.addListener(function (info) {
    var tab = chrome.tabs.get(info.tabId, function (tab) {
        //get current tab without any selectors
        console.log(" Tab activated with url " + tab.url);
        var url = domainFromUrl(tab.url)
        console.log("url:" + url);
        ValidateSessionAndPost(tab.url);
        setUrlData(url);
        getLastDayDataAboutUrl(tab.url);
    });

});

function isValidURL(string) {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
}

function injectContentScript(tab) {
    console.log('Injecting script');
    chrome.storage.sync.get(['Cohort'], function (result) {

        if (isEmptyObject(result)) {
            return;
        }
        const cohort = result.Cohort.cohort;
        console.log("Injecting cohort" + cohort);
        chrome.tabs.executeScript(tab.id, {
            runAt: 'document_start',
            code: `
                ;(function() {
                    function inject() {
                        console.log('${cohort}');
                        const script = document.createElement('script')
                        script.text="window.rp_visitor={cohort:'${cohort}'};";
                        document.head.appendChild(script);
                        console.log(window.rp_visitor);
                    }
                    inject();
                })();
            `,
        });
    })
}

function isEmptyObject(obj) {
    return JSON.stringify(obj) === '{}';
}

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

            console.log("CURRENT TIME " + new Date(item));

            console.log("TIME COMPARE " + cuurentDate);

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
        console.log("GOT MESSAGE");
        if (sender.url == blacklistedWebsite)
            return;  // don't allow this web page access
        if (request.openUrlInEditor)
            openUrl(request.openUrlInEditor);
    });
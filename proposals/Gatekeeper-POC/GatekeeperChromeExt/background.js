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
        setUrlData(changeInfo.url);
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

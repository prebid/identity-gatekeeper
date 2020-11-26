'use strict';

var id=0;
var getId = function () {
    return id++;
}

function Deferred() {
	if (typeof(Promise) != 'undefined' && Promise.defer) {
		return Promise.defer();
	} else if (typeof(PromiseUtils) != 'undefined'  && PromiseUtils.defer) {
		return PromiseUtils.defer();
	} else {
		this.resolve = null;
        this.reject = null;
        
		this.promise = new Promise(function(resolve, reject) {
			this.resolve = resolve;
			this.reject = reject;
		}.bind(this));
		Object.freeze(this);
	}
}

var _outstandingCalls = {};

var IframeStorage = function (options) {
    this.url = options.url;

    // setup hidden iframe for communication
    this.iframe = document.createElement('iframe');
    this.iframe.style.display = "none";
    this.iframe.setAttribute('id', 'iframe');
    this.iframe.setAttribute('name', 'iframe');
    this.iframe.setAttribute('src', this.url);

    var d = new Deferred();
    this.readyPromise = d.promise;
    if (this.iframe.attachEvent){
        this.iframe.attachEvent("onload", function(){
            d.resolve();
        });
    } else {
        this.iframe.onload = function(){
            d.resolve();
        };
    }

    document.body.appendChild(this.iframe);
    window.addEventListener('message', this._receiveMessage, false);
};

IframeStorage.prototype = {

    getItem: function (key) {
        return this._callMethod('getSessionVar', {key: key});
    },

    setItem: function (key, value) {
        return this._callMethod('storeSessionVar', {key: key, value: value});
    },

    removeItem: function (key) {
        return this._callMethod('removeSessionVar', {key: key});
    },

    _callMethod: function (method, params) {
        var that = this;
        var d = new Deferred();
        var callId = getId();
        var message = {
            method: method,
            params: params,
            id: callId
        }
        _outstandingCalls[callId] = d;
        
        this.readyPromise.then(function () {
            that.iframe.contentWindow.postMessage(JSON.stringify(message), that.url);
        });
        return d.promise;
    },

    _receiveMessage: function (e) {
        if (typeof e.data === 'object') {
            return;
        }

        try {
            var message = JSON.parse(e.data);
        } catch (e) {
            return;
        }

        if(!message || !(message.id in _outstandingCalls)) {
            return;
        }
        if (message.error) {
             _outstandingCalls[message.id].reject(message.error);
        } else {
            _outstandingCalls[message.id].resolve(message.response);
        }
        delete _outstandingCalls[message.id];
    }
}

window.ProprietaryCohorts = {
    d: new Deferred(), 
    cohortId: 'foo',
    providerId: 'magnite',
    getCohortId: function () {
        return window.ProprietaryCohorts.d.promise;
    }
};

window.onload= function() {
    var iframeStorage = new IframeStorage({
        url: 'https://magniteengineering.github.io/ProprietaryCohorts/src/browser/iframe.html'
        // url: 'http://localhost:8080/src/browser/iframe.html'
    });

    var storageKey = 'PC_STATE_' + window.ProprietaryCohorts.providerId;

   iframeStorage.getItem(storageKey).then(function (value) {
        console.log('got state from storage');
        console.log(value);
        var state = JSON.parse(value) || {};

        if (window.ProprietaryCohorts && window.ProprietaryCohorts.classifier) {
            window.ProprietaryCohorts.cohortId = window.ProprietaryCohorts.classifier(window.location.href, state);
        }
        window.ProprietaryCohorts.d.resolve(window.ProprietaryCohorts.cohortId);

        iframeStorage.setItem(storageKey, JSON.stringify(state));
    });
};
'use strict';

var id = 0;
var getId = function () {
    return id++;
}

function Deferred() {
    if (typeof (Promise) != 'undefined' && Promise.defer) {
        return Promise.defer();
    } else {
        this.resolve = null;
        this.reject = null;

        this.promise = new Promise(function (resolve, reject) {
            this.resolve = resolve;
            this.reject = reject;
        }.bind(this));
        Object.freeze(this);
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
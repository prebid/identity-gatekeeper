function decorateLog(args, prefix) {
    args = [].slice.call(args);
    prefix && args.unshift(prefix);
    args.unshift('display: inline-block; color: #fff; background: #3b88c3; padding: 1px 4px; border-radius: 3px;');
    args.unshift('%cIdentity');
    return args;
}

const utils = {
    request: function (url, method) {
        return new Promise(function (resolve, reject) {
            const req = new XMLHttpRequest();
            req.responseType = 'json';
            req.open(method, url);
            req.send();
            req.onerror = function () {
                reject(new Error("Network Error"))
            }
            req.onload = (e) => {
                if (req.status === 200) {
                    resolve(req.response);
                } else {
                    const error = new Error(req.statusText);
                    error.code = req.status;
                    reject(error);
                }
            }
        });
    },

    logMessage: function () {
        console.log.apply(console, decorateLog(arguments, 'MESSAGE:'));
    },

    logInfo: function () {
        console.info.apply(console, decorateLog(arguments, 'INFO:'));
    },

    logWarn: function () {
        console.warn.apply(console, decorateLog(arguments, 'WARNING:'));
    },

    logError: function () {
        console.error.apply(console, decorateLog(arguments, 'ERROR:'));
    },
}

// --------------------------------------------------------

const DOMAIN_DEFINITIONS_URL = "http://127.0.0.1:8000/api/v1/definitions/domains/"
const COHORT_DEFINITIONS_URL = "http://127.0.0.1:8000/api/v1/definitions/cohorts/";
const DEFAULT_COHORT_ID = '0';

function keysIntersection(mapA, mapB) {
    const result = new Set();
    [...mapA.keys()].forEach(key => {
        if (mapB.has(key)) {
            result.add(key);
        }
    });
    return result;
}

function getCohortContentByHistory(topLevelDomains, dictionary) {
    // not taking into account time spent
    const groupByContent = topLevelDomains
        .map(item => dictionary.has(item) ? dictionary.get(item) : new Map())
        .reduce((acc, curr) => {
            curr.forEach((value, key) => {
                let valueSum = acc.has(key) ? acc.get(key) : 0.0;
                acc.set(key, valueSum + value);
                return acc;
            });
            return acc;
        }, new Map());

    const cohortContent = new Map();
    if (groupByContent.size !== 0) {
        const sumPercentage = Array.from(groupByContent.entries()).reduce((acc, curr) => acc + curr[1], 0)
        groupByContent.forEach((value, key) => {
            cohortContent.set(key, Math.round(10000 * value / sumPercentage) / 10000);
        });
    }

    return {
        'toplevels': topLevelDomains,
        'cohortContent': cohortContent
    };
}

function getCohortId(cohortContent, cohortDefinitions) {
    const historyContent = cohortContent['cohortContent'];
    if (historyContent.size === 0) {
        return DEFAULT_COHORT_ID;
    }
    const distanceLeft = Math.sqrt(Array.from(historyContent.entries())
        .map(item => item[1] * item[1])
        .reduce((acc, curr) => acc + curr, 0));

    // Find the best-matching user cohort from cohortDefinitions, using the cosine similarity
    const simList = new Map();

    cohortDefinitions.forEach((value, cohortId) => {
        const currentCohortDefinitionMap = new Map(Object.entries(value['cohortContentExist']));
        const intersection = keysIntersection(historyContent, currentCohortDefinitionMap);

        const crossProduct = [...intersection]
            .map(key => historyContent.get(key) * currentCohortDefinitionMap.get(key))
            .reduce((acc, curr) => acc + curr, 0);

        const distanceRight = Math.sqrt(Array.from(currentCohortDefinitionMap.entries())
            .map(item => item[1] * item[1])
            .reduce((acc, curr) => acc + curr, 0)
        );

        simList.set(cohortId, Math.round(crossProduct / (distanceLeft * distanceRight) * 100) / 100);
    });

    if (simList.size === 0) {
        return DEFAULT_COHORT_ID;
    }

    const cohort = [...simList.entries()].reduce((acc, curr) => curr[1] > acc[1] ? curr : acc);
    return cohort[0];
}

function getDomain(url) {
    const parsed = new URL(url);
    return parsed.hostname;
}

function getTopLevelDomains(history) {
    return history.map(item => getDomain(item));
}

if (ProprietaryCohorts) {
    ProprietaryCohorts.classifier = function (url, state) {
        if (typeof state !== 'object') {
            console.log('state is not an object')
            return;
        }

        if (!Array.isArray(state.history)) {
            state.history = [];
        }
        state.history = [
            'http://addweek.com/',
            'http://6pm.com?param=true',
            'http://smth.com'
        ];
        state.history.push(url);

        const domainsUrl = DOMAIN_DEFINITIONS_URL + '?domains=' + getTopLevelDomains(state.history).join(',');
        const domainDefinitionsPromise = utils.request(domainsUrl, 'GET')
            .then(response => {
                const topLevelDefinitions = new Map();
                Object.entries(response).forEach(entry => {
                    topLevelDefinitions.set(entry[0], new Map(Object.entries(entry[1])));
                })
                return topLevelDefinitions;
            });

        const cohortDefinitionsPromise = utils.request(COHORT_DEFINITIONS_URL, 'GET')
            .then(response => {
                const cohortDefinitions = new Map();
                Object.entries(response).forEach(entry => {
                    cohortDefinitions.set(entry[0], entry[1]);
                })
                return cohortDefinitions;
            });

        return Promise.all([domainDefinitionsPromise, cohortDefinitionsPromise])
            .then(results => {
                const topLevel = getTopLevelDomains(state.history);
                const historyCohortContent = getCohortContentByHistory(topLevel, results[0]);
                state.cohortId = getCohortId(historyCohortContent, results[1]);
                console.log(`Cohort: ${state.cohortId}`);
                return state.cohortId;
            });
    }

}

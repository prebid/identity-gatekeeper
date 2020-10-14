function getCohortId() {
    var content = document.getElementById('content');
    var score = document.getElementById('score');
    chrome.storage.sync.get('Cohort', function (result) {
        if(isEmptyObject(result)){
            return;
        }
        console.log("Current Cohort: " + result.Cohort.cohort);
        content.innerHTML = result.Cohort.cohort;
        score.innerHTML = result.Cohort.score
    });
}
document.addEventListener('DOMContentLoaded', function () {
    getCohortId();
});

function isEmptyObject(obj){
    return JSON.stringify(obj) === '{}';
}

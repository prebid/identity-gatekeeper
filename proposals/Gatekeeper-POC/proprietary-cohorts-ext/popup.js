function clear() {
    console.log("Trying to clear extension history");

    chrome.storage.local.clear(function (obj) {
        document.getElementById('clearAllDataResult').innerText = "Cleared";
        console.log("cleared");
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('clearAllData').addEventListener('click', clear);
});

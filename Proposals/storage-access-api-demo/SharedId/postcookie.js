Cookies.defaults = {
  expires: 365,
  path: '',
  domain: window.location.hostname.split('.').slice(-2).join('.'),
};
var sharedId = document.getElementById('sharedId');

function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function storageAccessAPISupported() {
  return (
    'hasStorageAccess' in document &&
    'requestStorageAccess' in document
  );
}

function accessStorage() {
  document.hasStorageAccess()
    .then(function (hasAccess){
      if (hasAccess) {
        console.info('Storage API Access already granted');
        var sharedid = Cookies.get('sharedId')
        parent.postMessage({
          command: 'sharedId',
          data: sharedid
        }, "*");
        return;
      }

      console.info('no existing Storage API Access ...');
      console.info('requesting Storage API Access ...');

      document.requestStorageAccess()
        .then(function () {
          console.info('Storage API Access granted.');

          return;
        }, function (){
          console.warn('Storage API Access denied.');
        });
    }, function (reason) {
      console.warn('something went wrong ...');
      console.error(reason);
    });
}



function onReady() {
  if (!storageAccessAPISupported()) {
    sharedId.innerText = 'Storage Access API not supported';
    return;
  }
  accessStorage();
}

ready(onReady)

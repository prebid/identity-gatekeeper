Cookies.defaults = {
  expires: 365,
  path: '',
  domain: window.location.hostname.split('.').slice(-2).join('.'),
};
var sharedId = document.getElementById('sharedId');
var btn = document.getElementById('test');

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

function requestAccess(fn) {
  document.requestStorageAccess()
    .then(function () {
      console.info('Storage API Access granted.');
      fn();
      return;
      }, function (){
      console.warn('Storage API Access denied.');
      });
  }

function hasAccess() {
  document.hasStorageAccess()
    .then(hasAccess =>{
      if (hasAccess) {
        console.info('Frame has Storage Access');
      } else {
        console.info('Frame does not have Storage Access');
      }
    });
  }

function onUpdated(event) {
  renderUid(event.detail.sharedId);
  console.info('OnUpdate Called');
}

function updateId() {
  var key = 'sharedId';
  var newId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);  //uuid.v4();

  Cookies.set(key, newId);
  var data = Cookies.get(key) || '(none)';
  var updateEvent = new CustomEvent('sharedId:updated', {
    bubbles: true,
    cancelable: false,
    detail: {
      sharedId: data,
    },
  });
  sharedId.dispatchEvent(updateEvent);
}

function renderUid(data) {
  sharedId.innerText = data;
}

function init() {
  var data = Cookies.get('sharedId') || '(none)';
  var updateEvent = new CustomEvent('sharedId:updated', {
    bubbles: true,
    cancelable: false,
    detail: {
      sharedId: data,
    },
  });
  sharedId.dispatchEvent(updateEvent);
  btn.innerText = 'Update ID';
}

function attachEventHandlers() {
  sharedId.addEventListener('sharedId:updated', onUpdated);
  btn.addEventListener('click', requestAccess.bind(null, updateId));
}

function onReady() {
  if (!storageAccessAPISupported()) {
    btn.setAttribute('disabled', true);
    btn.classList.add('pure-button-disabled');
    btn.innerText = 'Storage Access API not supported';
    return;
  } 
  hasAccess();
  attachEventHandlers();
  init();
}

ready(onReady)

function optout() {
  var key = 'sharedId';
  var optOutValue = "00000000000000000000000000"

  Cookies.set(key, optOutValue);
  init();
}

(function () {
  var input = document.getElementById("file");

  if (window.FormData) {
    document.getElementById("btn").style.display = "none";
  }

  if (input.addEventListener) {
    input.addEventListener("change", function (evt) {
      var i = 0, len = this.files.length, file;

      document.getElementById("response").innerHTML = "Uploading . . .";

      for (; i < len; i++) {
        file = this.files[i];
        prepareTranslate(file);
      }
    }, false);
  }
}());

/**
 * @param {File} file
 * @param {int} id
 */
function uploadFile(file, id) {
  var formdata = new FormData();
  if (!!file.type.match(/image.*/)) {
    if (window.FileReader) {
      var reader = new FileReader();
      reader.onloadend = function (e) {
        showUploadedItem(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    if (formdata) {
      formdata.append("file", file);
    }
  }
  var xhr = new XMLHttpRequest();
  xhr.open('POST', "/upload?id=" + id + "&filename=" + file.name + "&type=" + file.type, true);
  xhr.onreadystatechange = function () {
    if (this.readyState != 4)
      return;
    console.log(this.responseText);
    document.getElementById("response").innerHTML = 'SUCCESS';
  };
  xhr.send(file);
}

function showUploadedItem(source) {
  var list = document.getElementById("image-list"),
    li = document.createElement("li"),
    img = document.createElement("img");
  img.src = source;
  li.appendChild(img);
  list.appendChild(li);
}

window.onload = function () {
  var div = document.getElementById('div');
  div.ondragenter = div.ondragover = function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    div.style.background = 'red';
    return false;
  };
  div.ondragleave = function(e) {
    div.style.background = '';
  };
  div.ondrop = function (e) {
    for (var i = 0; i < e.dataTransfer.files.length; i++) { // e.dataTransfer is a DataTransfer object (https://developer.mozilla.org/En/DragDrop/DataTransfer), e.dataTransfer.files is a FileList object (https://developer.mozilla.org/en/DOM/FileList)
      var file = e.dataTransfer.files[i]; // file is a File object (https://developer.mozilla.org/en/DOM/File)
      prepareTranslate(file);
    }

    e.preventDefault();
    return false;
  }
};

var toSend = null;
var id;
function prepareTranslate(file) {
  if(!ok) {
    return ;
  }
  toSend = file;
  id = parseInt(Math.random() * 100);
  socket.emit('request send', id);
}
var ok = false;
var socket = io.connect();
socket.on('reqest receive', function() {
  alert('go?');
  uploadFile(toSend, id);
});
socket.on('request get', function(dd){

  socket.emit('readytodown');
  setTimeout(function(){
    location.href = '/download?id=' + dd;
  }, 300);
});



socket.on('connect', function(){
  ok = true;
});
socket.on('set name', function(){
  socket.emit('set name', getSystem() + "_" + parseInt(Math.random() * 10000));
});
socket.on('ready', function() {
  socket.emit('get users');
});
socket.on('user list', function(users){
  console.log(users);
});

function getSystem() {
  var OSName="Unknown OS";
  if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
  if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
  if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
  if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";

  return OSName;
}
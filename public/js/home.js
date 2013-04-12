/**
 * Created with JetBrains PhpStorm.
 * User: huangjin02
 * Date: 13-4-12
 * Time: 下午10:00
 * To change this template use File | Settings | File Templates.
 */
(function(){
  var ok = false;
  var socket = io.connect();
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
    delete users[socket.id];
    renderUserList(users);
  });
  socket.on('request get', function(trans_id){
    location.href = '/download?id=' + trans_id;
    socket.emit('readytodown', trans_id);
  });
  socket.on('reqest receive', function(trans_id) {
    uploadFile(toSend, trans_id);
  });


  function getSystem() {
    var OSName="Unknown OS";
    if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
    if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
    if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
    if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";

    return OSName;
  }

  function uploadFile(file, id) {
    var formdata = new FormData();
//    if (!!file.type.match(/image.*/)) {
//      if (window.FileReader) {
//        var reader = new FileReader();
//        reader.onloadend = function (e) {
//          showUploadedItem(e.target.result);
//        };
//        reader.readAsDataURL(file);
//      }
      if (formdata) {
        formdata.append("file", file);
      }
//    }
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

  function getPosition() {
    var x = parseInt(Math.random() * 100),
      y = parseInt(Math.random() * 100),
      times = 5;
    while( Math.pow(x-50, 2) / 200 + Math.pow(100 - y, 2)/600 < 1 && times -- > 0) {
      x = parseInt(Math.random() * 100);
      y = parseInt(Math.random() * 100);
    }
    return {x: x, y: y};
  }

  function renderUserList(users){
    function tpl(data) {
      return '<div class="person circle user" style="left:' + data.left + '%;top:' + data.top + '%;" data-sid="' + data.sid+ '"></div>'
    }
    var userContainer = document.querySelector('#users');
    var html = '';
    for(var i in users) {
      if(!users.hasOwnProperty(i)) {
        continue;
      }
      var p = getPosition();
      html += tpl({
        sid : i,
        left : p.x,
        top : p.y
      });
    }
    userContainer.innerHTML = html;


//    var ul = document.querySelector('#users ul');
//    ul.innerHTML = '';
//    for(var i in users) {
//      if(!users.hasOwnProperty(i)) {
//        continue;
//      }
//      var li = document.createElement('li');
//      li.dataset.sid = i;
//      li.innerHTML = '<span>' + users[i] + '</span>';
//      ul.appendChild(li);
//    }
  }


  var userElement = document.getElementById('users');
  userElement.addEventListener('dragenter', function(e) {
    if(e.target.className.indexOf('user') > -1) {
      console.log('ondragenter');
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      var el = e.target;
      var cn = " " + el.className.trim() + " ";
      if(cn.indexOf(" bigger ") == -1) {
        cn = cn.trim().split(" ");
        cn.push('bigger');
        el.className = cn.join(" ");
      }
    }
  });
  userElement.addEventListener('dragover', function(e) {
    if(e.target.className.indexOf('user') > -1) {
      console.log('ondragover');
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  });
  userElement.addEventListener('dragleave', function(e) {
    if(e.target.className.indexOf('user') > -1) {
      console.log('ondragleave');
      e.preventDefault();
      var el = e.target;
      el.className = (" " + el.className.trim() + " ").replace(/ bigger /g, "").trim();
    }
  });
  userElement.addEventListener('drop', function(e) {
    if(e.target.className.indexOf('user') > -1) {
      console.log('ondrop');
      e.preventDefault();
      var el = e.target;
      el.className = (" " + el.className.trim() + " ").replace(/ bigger /g, "").trim();

      for (var i = 0; i < e.dataTransfer.files.length; i++) { // e.dataTransfer is a DataTransfer object (https://developer.mozilla.org/En/DragDrop/DataTransfer), e.dataTransfer.files is a FileList object (https://developer.mozilla.org/en/DOM/FileList)
        var file = e.dataTransfer.files[i]; // file is a File object (https://developer.mozilla.org/en/DOM/File)
        prepareTranslate(file, el.dataset.sid);
      }

    }
  });

  var toSend;
  function prepareTranslate(file, target) {
    if(!ok) {
      return ;
    }
    toSend = file;
    socket.emit('request send', target);
  }
}());

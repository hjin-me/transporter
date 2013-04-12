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
    renderUserList(users);
  });


  function getSystem() {
    var OSName="Unknown OS";
    if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
    if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
    if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
    if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";

    return OSName;
  }

  function renderUserList(users){
    var ul = document.querySelector('#users ul');
    ul.innerHTML = '';
    for(var i in users) {
      if(!users.hasOwnProperty(i)) {
        continue;
      }
      var li = document.createElement('li');
      li.dataset.sid = i;
      li.innerHTML = '<span>' + users[i] + '</span>';
      ul.appendChild(li);
    }
  }
}());

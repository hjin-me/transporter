"use strict";
angular.module('Tasks',[]).factory('TaskQueue', function(){
  var TaskQueue = function() {
    this.queues = [];
    this.counter = 0;
    this.options = {
      tid : null,
      sid : null,
      file : null,
      progress : 0,
      status : 'ready',
      xhr : null
    }
  };
  TaskQueue.prototype.push = function(task) {
    task = angular.extend({}, this.options, task);
    if(!task.tid) {
      task.tid = task.sid + "|" + (++this.counter);
    }
    this.queues.push(task);
    return task;
  };
  TaskQueue.prototype.shift = function() {
    return this.queues.shift();
  };
  TaskQueue.prototype.pop = function() {
    return this.queues.pop();
  };
  TaskQueue.prototype.get = function() {
    return this.queues;
  };
  return new TaskQueue();
});

var app = angular.module('Transporter', ['Tasks']);

app.directive('client', function(){
  return {
    restrict: 'E',
    templateUrl: '/templates/client.html',
    replace: true,
    transclude: true,
    scope: {}
  };
});

app.directive('dropupload', function() {
  return {
    restrict: 'A',
    link: function (scope, elem) {
      var ddcounter = 0;
      elem.bind('dragenter', function(e){
        e.preventDefault();
        ddcounter ++;
        if(ddcounter > 0) {
          e.dataTransfer.dropEffect = 'copy';
          elem.addClass('bigger');
        }
        return false;
      });
      elem.bind('dragleave', function(e){
        e.preventDefault();
        ddcounter --;
        if(ddcounter < 1) {
          elem.removeClass('bigger');
        }
        return false;
      });
      elem.bind('dragover', function(e){
        e.preventDefault();
        return false;
      });
      elem.bind('drop', function(e){
        e.stopPropagation();
        e.preventDefault();
        console.log('ondrop');
        elem.removeClass('bigger');
        ddcounter = 0;

        var scope = angular.element(document.getElementById('upload')).scope();

        for (var i = 0; i < e.dataTransfer.files.length; i++) { // e.dataTransfer is a DataTransfer object (https://developer.mozilla.org/En/DragDrop/DataTransfer), e.dataTransfer.files is a FileList object (https://developer.mozilla.org/en/DOM/FileList)
          var file = e.dataTransfer.files[i]; // file is a File object (https://developer.mozilla.org/en/DOM/File)
          console.log(file.name);
          scope.$apply((function(f){
            return scope.addTask(elem[0].dataset.sid, f);
          }(file)));
        }
      });
    }
  }
});

app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

app.factory('User', function() {
  return {
    set name (val) {
      localStorage.name = val;
    },
    get name () {
      return localStorage.name || 'Someone.';
    }
  }
});

app.factory('Client', function() {
  var Client = function() {
    this.clients = [];
  };
  Client.prototype.indexOf = function(client) {
    for(var i = 0, n = this.clients.length; i < n; i ++) {
      if(this.clients[i].sid == client.sid) {
        return i;
      }
    }
    return -1;
  };
  Client.prototype.add = function(client) {
    var pos = this.indexOf(client);
    if(pos > -1) {
      this.clients.splice(pos, 1, [client]);
    } else {
      this.clients.push(client);
    }
  };
  Client.prototype.remove = function(client) {
    var pos = this.indexOf(client);
    if(pos > -1) {
      this.clients.splice(pos, 1);
    }
  };
  Client.prototype.clear = function() {
    this.clients.length = 0;
  };
  Client.prototype.get = function() {
    return this.clients;
  };
  return new Client();
});

app.run(function(socket, User){
  socket.on('connect', function () {
    console.log('connect');
  });
  socket.on('get name', function() {
    socket.emit('set name', User);
  });
  socket.on('ready', function() {
    socket.emit('get users');
  });
});

app.controller('UploadCtrl', function($scope, socket, TaskQueue){
  $scope.queues = TaskQueue.get();
  $scope.addTask = function(sid, file) {
    console.log('add task', file.name);
    var task = TaskQueue.push({
      sid : sid,
      file : file
    });
    socket.emit('transport request', {tid : task.tid, filename : file.name});
  };
  $scope.cancelTask = function(tid) {
    for(var i = 0, n = $scope.queues.length; i < n ;i ++) {
      if($scope.queues[i].tid == tid) {
        $scope.queues[i].status = 'cancel';
        $scope.queues[i].progress = 100;
        $scope.queues[i].xhr && $scope.queues[i].xhr.abort();
        return ;
      }
    }
  };
  $scope.execTask = function(trans_id) {
    var t = trans_id.split('|');
    var tid = t[1] + '|' + t[2];
    var file;
    for(var i = 0, n = $scope.queues.length; i < n; i ++) {
      if($scope.queues[i].tid == tid) {
        file = $scope.queues[i].file;
        break;
      }
    }

    if(!file) {
      return ;
    }

    var formdata = new FormData();
    if (formdata) {
      formdata.append("file", file);
    }
    var xhr = new XMLHttpRequest();
    $scope.queues[i].xhr = xhr;
    // progress bar
    xhr.upload.addEventListener("progress", function(e) {
      $scope.$apply(function(){
        var pc = parseInt((e.loaded / e.total * 100));
        for(var i = 0, n = $scope.queues.length; i < n; i ++) {
          if($scope.queues[i].tid == tid) {
            $scope.queues[i].progress = pc;
            $scope.queues[i].status = 'uploading';
            return
          }
        }
      });
    }, false);
    xhr.onreadystatechange = function () {
      if (this.readyState != 4)
        return;
      console.log(this.responseText);
      $scope.$apply(function(){
        for(var i = 0, n = $scope.queues.length; i < n; i ++) {
          if($scope.queues[i].tid == tid) {
            $scope.queues[i].progress = 100;
            $scope.queues[i].status = 'finish';
            return
          }
        }
      });
    };
    xhr.open('POST', "/upload?id=" + trans_id + "&filename=" + file.name + "&type=" + file.type, true);

    xhr.send(file);
  };

  socket.on('transport ready', function(trans_id) {
    console.log(trans_id);
    $scope.execTask(trans_id);
  });
  socket.on('transport refuse', function(trans_id) {
    console.log(trans_id);
    var t = trans_id.split("|");
    var tid =  t[1] + '|' + t[2];
    $scope.cancelTask(tid);
    t = tid = null;
  });
});

app.controller('InfoCtrl', function($scope, socket, User){
  $scope.name = User.name;
  $scope.changeName = function() {
    $scope.name = prompt('请输入姓名', User.name || 'John');
    User.name = $scope.name;
    socket.emit('rename', User);
  }
});
app.controller('ClientsCtrl', function($scope, socket, Client){
  $scope.clients = Client.get();
  $scope.dialog = {
    show : false,
    name : '',
    sid : '',
    message : ''
  };
  $scope.alert = {
    show : false,
    message : ''
  };

  $scope.showDialog = function(name, sid) {
    $scope.dialog.name = name;
    $scope.dialog.sid = sid;
    $scope.dialog.show = true;
  };

  $scope.hideDialog = function() {
    $scope.dialog.show = false;
  };

  $scope.sendMessage = function() {
    socket.emit('message:send', {
      sid : $scope.dialog.sid,
      message : $scope.dialog.message
    });
    $scope.dialog.message = '';
    $scope.hideDialog();
  };

  socket.on('user list', function(clients) {
    Client.clear();
    for(var i in clients) {
      if(clients.hasOwnProperty(i)) {
        Client.add(clients[i]);
      }
    }
  });
  socket.on('user leave', function(sid) {
    Client.remove({sid: sid});
  });

  socket.on('user enter', function(client) {
    Client.add(client);
  });

  socket.on('user rename', function(sid, name) {
    for(var i = 0, n = $scope.clients.length; i < n; i ++) {
      if($scope.clients[i].sid == sid) {
        $scope.clients[i].name = name;
        return ;
      }
    }
  });

  socket.on('message:receive', function(data){
    var user;
    console.log(Client.get());
    console.log(data);
    for(var i = 0, n = $scope.clients.length; i < n; i ++) {
      if($scope.clients[i].sid == data.sid) {
        user = $scope.clients[i].name;
        break;
      }
    }
    $scope.alert.show = true;
    $scope.alert.message = data.message;
    $scope.alert.name = user || '未知';
  });
});

app.controller('DownloadCtrl', function($scope, socket, Client) {
  $scope.list = [];
  $scope.download = function(url) {
    $scope.list.push(url);
  };

  socket.on('transport request', function(trans_id, filename){
    console.log('transport request');
    var t = trans_id.split('|'), user;
    var clients = Client.get();
    for(var i = 0, n = clients.length; i < n; i ++) {
      if(clients[i].sid == t[0]) {
        user = clients[i].name;
        break;
      }
    }
    console.log(user);
    if(!user) {
      return ;
    }
    var r = confirm(user + ' 想发送[ ' + filename + ' ]给你，是否接受');
    if(r) {
      $scope.download('/download?id=' + trans_id);
    } else {
      socket.emit('transport refuse', trans_id);
    }
  })
});



app.controller('DialogCtrl', function($scope) {
  $scope.showDialog = function(name, sid) {
  };

  $scope.hideDialog = function() {
  };
});
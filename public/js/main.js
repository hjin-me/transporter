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
      status : 'ready'
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
      elem.bind('dragenter', function(e){
        e.preventDefault();
        return false;
      });
      elem.bind('dragleave', function(e){
        e.preventDefault();
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
  return [];
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
    socket.emit('transport request', task.tid);
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
    // progress bar
    xhr.upload.addEventListener("progress", function(e) {
      $scope.$apply(function(){
        var pc = parseInt(100 - (e.loaded / e.total * 100));
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
  })
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
  $scope.clients = Client;

  socket.on('connect', function () {
    $scope.clients = Client;
  });

  socket.on('user list', function(clients) {
    for(var i in clients) {
      if(clients.hasOwnProperty(i)) {
        $scope.clients.push(clients[i]);
      }
    }
  });
  socket.on('user leave', function(sid) {
    for(var i = 0, n = $scope.clients.length; i < n; i ++) {
      if($scope.clients[i].sid == sid) {
        $scope.clients.splice(i, 1);
        return ;
      }
    }
  });

  socket.on('user enter', function(client) {
    $scope.clients.push(client);
  });

  socket.on('user rename', function(sid, name) {
    for(var i = 0, n = $scope.clients.length; i < n; i ++) {
      if($scope.clients[i].sid == sid) {
        $scope.clients[i].name = name;
        return ;
      }
    }
  });
});

app.controller('DownloadCtrl', function($scope, socket, Client) {
  $scope.list = [];
  $scope.download = function(url) {
    $scope.list.push(url);
  };

  socket.on('transport request', function(tid, filename){
    var t = tid.split('|'), user;
    for(var i = 0, n = Client.length; i < n; i ++) {
      if(Client[i].sid == t[0]) {
        user = Client[i].name;
        break;
      }
    }
    if(!user) {
      return ;
    }
    var r = confirm(user + ' 想发送[ ' + filename + ' ]给你，是否接受');
    if(r) {
      $scope.download('/download?id=' + tid);
    }
  })
});
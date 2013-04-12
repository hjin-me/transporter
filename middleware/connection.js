/**
 * Created with JetBrains PhpStorm.
 * User: huangjin02
 * Date: 13-4-12
 * Time: 下午8:56
 * To change this template use File | Settings | File Templates.
 */

var clients = {};
var users = {};

exports.dispatcher = function() {
  return function(req, res, next) {
    next();
  }
};

exports.manager = function(socket) {
  // 保存连接
  clients[socket.id] = socket;
  socket.on('disconnect', function(){
    delete clients[socket.id];
    delete users[socket.id];
  });

  // 设置用户信息
  socket.emit('set name');
  socket.on('set name', function(name) {
    console.log(name);
    socket.set('nickname', name, function(){
      socket.emit('ready');
      users[socket.id] = name;
    });
  });

  // 获取用户列表
  socket.on('get users', function(){
    socket.emit('user list', users);
  });

  // 邀请某个用户进 room
};


/**
 * Created with JetBrains PhpStorm.
 * User: huangjin02
 * Date: 13-4-12
 * Time: 下午8:56
 * To change this template use File | Settings | File Templates.
 */

var clients = {};
var users = {};
var transport = {};

exports.dispatcher = function () {
  return function (req, res, next) {
    req.pause();
    var urlParsed = require('url').parse(req.url);

    var trans_id;
    if (urlParsed.pathname === '/download') {
      console.log('----- start download ----');
      trans_id = require('querystring').parse(require('url').parse(req.url).query).id;
      console.log(trans_id);
      if(!transport[trans_id]) {
        transport[trans_id] = {};
      }
      transport[trans_id].write = res;

      var t = trans_id.split('|');
      var from = t[0];
      if (from in clients) {
        clients[from].emit('transport ready', trans_id);
      } else {
        socket.emit('error', 404, 'user is disconnected');
      }

      return ;
    }

    if (urlParsed.pathname == '/upload') {
      console.log('----- start upload ----');
      var query = require('querystring').parse(require('url').parse(req.url).query),
        type = query['type'],
        filename = query['filename'];
      trans_id = query['id'] || '';
      console.log(query);

      process.nextTick(function(){
        sendFile();
      });

      function sendFile(times) {
        times = times || 0;
        times ++;
        console.log(times);
        if(times > 3) {
          // lost connection
          console.log('retry too many times');
          req.on('data', function(){

          });
          req.on('end', function(){
            res.write(JSON.stringify({err_no: 404}));
            res.end();
          });

          try{
            transport[trans_id].write.end();
          }catch(e){
            console.log('connect lost')
          }

          return ;
        }
        if(!(trans_id in transport) || !transport[trans_id].write) {
          process.nextTick(function(){
            sendFile(times)
          });
          return ;
        }
        var download_res = transport[trans_id].write;
        download_res.setHeader('Content-type', type);
        download_res.setHeader('Content-Disposition', "attachment;filename=" + encodeURIComponent(filename));

        download_res.on('finish', function(){
          console.log('------------------ download end --------------------------');
          delete transport[trans_id];
          res.write(JSON.stringify({err_no: 0}));
          res.end();
        });

        console.log("-----------start transfer -------------");
        req.pipe(download_res);
        req.resume();
      }
      return ;
    }

    next();

  }
};

exports.manager = function (socket, all) {
  // 保存连接
  clients[socket.id] = socket;
  socket.on('disconnect', function () {
    delete clients[socket.id];
    delete users[socket.id];
    all.emit('user leave', socket.id);
  });

  // 设置用户信息
  socket.emit('get name');
  socket.on('set name', function (user) {
    console.log(user);
    socket.set('nickname', user.name, function () {
      socket.emit('ready');
      users[socket.id] = {
        name : user.name,
        sid : socket.id,
        uid : socket.id,
        headurl : ''
      };
      socket.broadcast.emit('user enter', users[socket.id]);
    });
  });

  socket.on('rename', function(user) {
    socket.set('nickname', user.name, function(){
      users[socket.id].name = user.name;
      socket.broadcast.emit('user rename', socket.id, user.name);
    });
  });

  // 获取用户列表
  socket.on('get users', function () {
    var u = JSON.parse(JSON.stringify(users));
    delete u[socket.id];
    console.log(u);
    socket.emit('user list', u);
  });

  socket.on('transport request', function(args) {
    console.log("transport request");
    var tid = args.tid;
    var filename = args.filename;
    var to = tid.split('|')[0];
    var trans_id = socket.id + "|" + tid + "|" + parseInt(Math.random() * 99999);
    transport[trans_id] = {};
    if (to in clients) {
      clients[to].emit('transport request', trans_id, filename);
    } else {
      socket.emit('error', 404, 'user is disconnected');
    }
    // socket.emit('file get', tid);
  });
  socket.on('transport ready', function(trans_id) {
    var t = trans_id.split("|"), from = t[0], tid = t[1] + '|' + t[2];
    if (from in clients) {
      clients[from].emit('transport ready', tid);
    } else {
      socket.emit('error', 404, 'user is disconnected');
    }
  });

  // 拒绝下载该文件
  socket.on('transport refuse', function(trans_id) {
    var from = trans_id.split("|")[0];
    if (from in clients) {
      clients[from].emit('transport refuse', trans_id);
    } else {
      socket.emit('error', 404, 'user is disconnected');
    }
  });

  socket.on('message:send', function(data) {
    var to = data.sid;
    if(to in clients) {
      clients[to].emit('message:receive', {
        message : data.message,
        sid : socket.id
      });
    } else {
      socket.emit('err', 404, 'user is disconnected');
    }
  })
};


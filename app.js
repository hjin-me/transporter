var connect = require('connect'),
  cors = require('./middleware/cors'),
  homepage = require('./middleware/homepage'),
  connection = require('./middleware/connection'),
  downloader = require('./middleware/downloader'),
  uploader = require('./middleware/uploader');


/* Port which provided by BAE platform */
var port = process.env.APP_PORT || 3000;

var app = connect()
    .use(cors())
    .use(homepage())
    .use(connection.dispatcher())
//    .use(prepare())
    .use(downloader())
    .use(uploader())
    .use(connect.static(__dirname + '/public'))
    .use(function (req, res) {
      console.log('serving!' + req.url);
      res.end('nothing');
    }),
  server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(port);


io.sockets.on('connection', function (socket) {
  connection.manager(socket);

  socket.on('request send', function(id){
    global.request[id] = {};
    socket.broadcast.emit('request get', id);
  });
  socket.on('readytodown', function(){
    socket.broadcast.emit('reqest receive');
  });
  socket.on('set nickname', function (name) {
    console.log(name);
    socket.set('nickname', name, function () {
      socket.emit('ready');
    });
  });

  socket.on('msg', function () {
    socket.get('nickname', function (err, name) {
      console.log('Chat message by ', name);
    });
  });
});
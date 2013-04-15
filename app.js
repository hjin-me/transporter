var connect = require('connect'),
  cors = require('./middleware/cors'),
  homepage = require('./middleware/homepage'),
  connection = require('./middleware/connection');


/* Port which provided by BAE platform */
var port = process.env.APP_PORT || 3000;

var app = connect()
    .use(cors())
    .use(homepage())
    .use(connection.dispatcher())
//    .use(prepare())
    .use(connect.static(__dirname + '/public'))
    .use(function (req, res) {
      console.log('serving!' + req.url);
      res.end('nothing');
    }),
  server = require('http').createServer(app);
var io = require('socket.io').listen(server);
io.set('log level', 3);

server.listen(port);


io.sockets.on('connection', function (socket) {
  connection.manager(socket);
});
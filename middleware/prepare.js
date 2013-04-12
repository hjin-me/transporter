/**
 * Created with JetBrains PhpStorm.
 * User: hjin
 * Date: 13-4-11
 * Time: PM9:46
 */
module.exports = function(){
  return function prepare(req, res, next) {
    console.log("----- start prepare ----");
    var urlParsed = require('url').parse(req.url);
    if(urlParsed.pathname != '/prepare') {
      next();
      return ;
    }

    var https = require('https'),
      http = require('http'),
      qs = require('querystring');

    var info = require('url').parse('https://pcs.baidu.com/rest/2.0/pcs/file?' + qs.stringify({
        'method': 'upload',
        access_token: '3.9f2d2573d8a2e33be3586191a250ecc5.2592000.1368206936.119227984-638860',
        path: '/apps/pikachu/test1_' + Math.random() + '.jpg'
      }))
      , path = info.pathname + (info.search || '')
      , options = { host: info.hostname, port: info.port || 443, path: path, method: 'POST',
        headers: {
          "Content-Type": req.headers['content-type'],
          "Content-Length": req.headers['content-length']
        }};

    var https_req = https.request(options, function (https_res) {
      var chunks = [], length = 0;
      https_res.on('data', function (chunk) {
        length += chunk.length;
        chunks.push(chunk);
      });
      https_res.on('end', function () {
        var buffer = new Buffer(length);
        for (var i = 0, pos = 0, l = chunks.length; i < l; i++) {
          chunks[i].copy(buffer, pos);
          pos += chunks[i].length;
        }
        https_res.body = buffer;
        console.log('upload success', https_res.statusCode, https_res.headers, https_res.body.toString('utf8'));
        res.statusCode = 200;
        res.write(JSON.stringify({'err_no' : 0, 'content' : 'success'}));
        res.end();
      });
    });

    req.pipe(https_req);
  };
};
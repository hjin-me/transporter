/**
 * Created with JetBrains PhpStorm.
 * User: hjin
 * Date: 13-4-11
 * Time: PM9:46
 */
module.exports = function(){
  return function uploader(req, res, next) {
    console.log("----- start uploader ----");
    var urlParsed = require('url').parse(req.url);
    if(urlParsed.pathname != '/upload') {
      next();
      return ;
    }

    var https = require('https'),
      http = require('http');

    var query = require('querystring').parse(require('url').parse(req.url).query);

    var id = query['id'] || '';
    var type = query['type'];
    var filename = query['filename'];
    var writeStream = global.request[id]['write'];
    writeStream.setHeader('Content-type', type);
    writeStream.setHeader('Content-Disposition', "attachment;filename=" + filename);

    writeStream.on('close', function(){
      res.end();
    });
    req.pipe(writeStream);
  };
};
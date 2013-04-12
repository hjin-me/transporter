/**
 * Created with JetBrains PhpStorm.
 * User: hjin
 * Date: 13-4-11
 * Time: PM9:46
 */
module.exports = function(){
  return function uploader(req, res, next) {
    console.log("----- start download ----");
    var urlParsed = require('url').parse(req.url);
    if(urlParsed.pathname != '/download') {
      next();
      return ;
    }

    var id = require('querystring').parse(require('url').parse(req.url).query).id;
    global.request[id].write = res;

  };
};
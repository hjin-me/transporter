/**
 * Created with JetBrains PhpStorm.
 * User: hjin
 * Date: 13-4-11
 * Time: PM9:46
 */
module.exports = function(){
  return function homepage(req, res, next) {
    var urlParsed = require('url').parse(req.url);
    if(urlParsed.pathname != '/') {
      next();
      return ;
    }
    console.log("----- start home page ----");

    var fs = require('fs');
    var fr = fs.createReadStream(__dirname + '/../public/templates/main.html', { flags: 'r', encoding: 'utf8'});
    fr.pipe(res);

    console.log('ended by homepage');
  };
};
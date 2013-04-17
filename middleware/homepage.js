/**
 * Created with JetBrains PhpStorm.
 * User: hjin
 * Date: 13-4-11
 * Time: PM9:46
 */
module.exports = function(){
  var tpl;
  return function homepage(req, res, next) {
    console.log("----- start home page ----");
    var urlParsed = require('url').parse(req.url);
    if(urlParsed.pathname != '/') {
      next();
      return ;
    }

    var jade = require('jade');
    var fs = require('fs');

    // Compile a function
    if(!tpl) {
      tpl = jade.compile(fs.readFileSync(__dirname + '/../views/home.jade', 'utf8'), {
        self : true
      });
    }
    res.write(tpl({
      title : '文件上传咯'
    }));
    res.end();

    console.log('ended by homepage');
  };
};
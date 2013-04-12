/**
 * Created with JetBrains PhpStorm.
 * User: hjin
 * Date: 13-4-11
 * Time: PM10:34
 * To change this template use File | Settings | File Templates.
 */
module.exports = function() {
  return function cors(req, res, next) {
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('access-control-allow-method', 'POST,OPTIONS');
    next();
  }
};
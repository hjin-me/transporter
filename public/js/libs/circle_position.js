/**
 *
 * @param {{x : Number, y : Number, xMax : Number, yMax : Number, xMin : Number, yMin : Number}} [config]
 * @constructor
 */
var CirclePosition = function (config) {
  config = config || {};
  this.currentAlpha = -27 + parseInt(Math.random() * 20 - 10);
  this.step = 47;
  this.start = 150;
  this.dr = 0.5;
  this.r = 100;
  this.boundary = {
    x: {
      max: config.xMax || document.body.offsetWidth,
      min: config.xMin || 0
    },
    y: {
      max: config.yMax || document.body.offsetHeight,
      min: config.yMin || 0
    }
  };
  this.center = {
    x: config.x || document.body.offsetWidth / 2,
    y: config.y || document.body.offsetHeight / 2
  };
  this.retry_times = 30;
};
/**
 * 给一个座标，计算座标是否超出边界
 *
 * @param {{x : Number, y : Number}} pos
 */
CirclePosition.prototype.isInBoundary = function (pos) {
  var ret = pos.x <= this.boundary.x.max && pos.x >= this.boundary.x.min &&
    pos.y <= this.boundary.y.max && pos.y >= this.boundary.y.min;
  console.log('-- is in boundary --');
  console.log(ret);
  return ret;
};
/**
 * 检查是否还有足够的空间来装新的图标
 * @return bool
 */
CirclePosition.prototype.isEnoughSpace = function () {
  var rMax, alpha = this.currentAlpha, maxTimes = this.retry_times;
  rMax = Math.pow( Math.pow((this.boundary.x.max - this.boundary.x.min)/2, 2) +
    Math.pow((this.boundary.y.max - this.boundary.y.min)/2, 2), 0.5);
  for(var i = maxTimes; i > 0; i --) {
    alpha = this.getRawPos(alpha).alpha;
    if(this.getR(alpha) < rMax) {
      return true;
    }
  }
  return false;
};

/**
 * 获取一个原始的座标，该座标不一定可用
 * @param {Number} [baseAlpha=false]
 * @returns {{x: number, y: number, alpha: number}}
 */
CirclePosition.prototype.getRawPos = function(baseAlpha) {
  baseAlpha = baseAlpha || false;
  var alpha = (baseAlpha === false ? this.currentAlpha : baseAlpha ) + 180;
  var rt = this.getR(alpha);
  var n = Math.floor(alpha / 360);
  var step = this.step;
  if (n > 1) {
    step = (1 - this.dr * 360 * (n - 1) / rt) * this.step;
  }
  alpha += step;
  if(baseAlpha === false) {
    this.currentAlpha += step;
  }
  var ret = {
    x : this.getX(alpha),
    y : this.getY(alpha),
    alpha : alpha
  };
  console.log('-- getRawPos --');
  console.log(ret);
  return ret;
};
/**
 * 获取一个新的可用点座标，并加上随机误差
 * 返回 false 表示没有足够空间去容纳新的点
 *
 * @param {bool|Number} [rand=false]
 * @returns {bool|{x: number, y: number}}
 */
CirclePosition.prototype.getPos = function (rand) {
  var rawPoint, maxTimes = this.retry_times;
  rand = rand || false;
  if(!this.isEnoughSpace()) {
    return false;
  }
  do {
    rawPoint = this.getRawPos();
    maxTimes --;
  } while (!this.isInBoundary(rawPoint) && maxTimes > 0);
  console.log(rawPoint);

  // 返回前加上误差值
  if(rand) {
    rawPoint.x += parseInt(Math.random() * rand - rand / 2);
    rawPoint.y += parseInt(Math.random() * rand - rand / 2);
  }
  return rawPoint;
};
/**
 * 计算点到圆中心的半径
 *
 * @param {Number} alpha deg
 * @returns {number}
 */
CirclePosition.prototype.getR = function (alpha) {
  alpha = alpha || this.currentAlpha;
  return Math.pow(Math.pow(this.getX(alpha) - this.center.x, 2) + Math.pow(this.getY(alpha) - this.center.y, 2), 0.5);
};
/**
 * 计算点的横座标
 *
 * @param {Number} alpha deg
 * @returns {number}
 */
CirclePosition.prototype.getX = function (alpha) {
  alpha = alpha || this.currentAlpha;
  return Math.cos(1 / 180 * alpha * Math.PI) * this.dr * alpha + this.center.x;
};

/**
 * 计算点的纵座标
 *
 * @param {Number} alpha deg
 * @returns {number}
 */
CirclePosition.prototype.getY = function (alpha) {
  alpha = alpha || this.currentAlpha;
  return -Math.sin(1 / 180 * alpha * Math.PI) * this.dr * alpha + this.center.y;
};
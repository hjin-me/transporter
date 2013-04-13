var CirclePosition = function(config) {
  config = config || {};
  this.currentAlpha = -27 + parseInt(Math.random() * 20 - 10);
  this.step = 47;
  this.start = 150;
  this.dr = 0.5;
  this.r = 100;
  this.limit = {
    x : config.xMax || document.body.offsetWidth,
    y : config.yMax || document.body.offsetHeight
  };
  this.center = {
    x : config.x || document.body.offsetWidth / 2,
    y : config.y || document.body.offsetHeight / 2
  }
};

CirclePosition.prototype.getPos = function() {
  var alpha, rt, t, n, step = this.step;
  do {
    alpha = this.currentAlpha + 180;
    rt = this.getR(alpha);
    n = Math.floor(alpha / 360);
    if( n > 1 ) {
      step = (1 - this.dr * 360 * (n - 1) / rt) * this.step;
    }
    alpha += step;
    this.currentAlpha += step;
    t = alpha % 360;
  }while(t > 170 || t < 10);
  console.log(alpha, rt, step);
  return {
    x : this.getX(alpha) + parseInt(Math.random() * 40 - 20),
    y : this.getY(alpha) + parseInt(Math.random() * 40 - 20)
  }
};
CirclePosition.prototype.getR = function(alpha) {
  alpha = alpha || this.currentAlpha;
  return Math.pow(Math.pow(this.getX(alpha) - this.center.x, 2) + Math.pow(this.getY(alpha) - this.center.y, 2), 0.5);
};
CirclePosition.prototype.getX = function(alpha) {
  alpha = alpha || this.currentAlpha;
  return Math.cos(1/180 * alpha * Math.PI) * this.dr * alpha + this.center.x;
};
CirclePosition.prototype.getY = function(alpha) {
  alpha = alpha || this.currentAlpha;
  return - Math.sin(1/180 * alpha * Math.PI) * this.dr * alpha + this.center.y;
};
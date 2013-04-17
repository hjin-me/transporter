(function(){
  var Page = function(config) {
    config = config || {};
    this.users = {};
    this.freePos = [];
    this.usedPos = [];
    this.container = document.querySelector(config.container || '#users');
    this.cp = new CirclePosition({
      x : this.container.offsetWidth/2 + 40,
      y : this.container.offsetHeight,
      xMax : this.container.offsetWidth,
      yMax : this.container.offsetHeight,
      xMin : this.container.offsetLeft,
      yMin : this.container.offsetTop
    });
    this.current = {
      first : false,
      last : false
    }
  };

  Page.prototype.preRender = function(){
    for(var i = 0 ; i < 100; i ++) {
      var p = this.cp.getPos(60);
      if(!p) {
        // 没有足够空间来插入新的元素了
        break;
      }
      this.freePos.push(p);
    }
    this.freePos.sort(function() {
      return Math.random() - 0.5 < 0
    });
  };

  Page.prototype.renderExt = function() {
    var p, u, extUser = [], _self = this;
    function tpl(user) {
      var dom = document.createElement('div');
      dom.className = "person circle user hide";
      dom.style.cssText = 'left:' + user.pos.x + 'px;top:' + user.pos.y + 'px;';
      dom.dataset.sid = user.sid;
      dom.dataset.user = user.name;
      return dom;
    }

    // 从 UserManager 里面要用户
    while(p = this.freePos.pop()) {
      u = UserManager.useOneUser();
      if(!u) {
        this.freePos.push(p);
        break;
      }
      u.pos = p;
      this.users[u.uid] = u;
      extUser.push(u);
      this.usedPos.push(p);
      u.dom = tpl(u);
      u.hide();
    }

    // 把得到的用户填到页面上
    extUser.forEach(function(u){
      _self.container.appendChild(u.dom);
      // for css trans
      setTimeout(function() {
        u.show();
      }, parseInt(Math.random() * 1000));
    });
    extUser = null;
  };

  Page.prototype.render = function() {
    // 先计算一组布局
    this.preRender();

    // 从 UserManager 里面要用户，并插入页面
    this.renderExt();
  };
  Page.prototype.show = function() {
    for(var i in this.users) {
      if(this.users.hasOwnProperty(i)) {
        this.users[i].show();
      }
    }
  };
  Page.prototype.hide = function() {
    for(var i in this.users) {
      if(this.users.hasOwnProperty(i)) {
        this.users[i].hide();
      }
    }
  };

  window.Page = new Page();

}());
(function() {
  Page.preRender();
  UserManager.on('afteradduser', function() {
    Page.renderExt();
  });
  UserManager.on('beforeremoveuser', function(e, user) {
    var idx = false;
    Page.usedPos.forEach(function(p, index) {
      if(p.x == user.pos.x && p.y == user.pos.y) {
        idx = index;
      }
    });
    if(typeof idx == 'number') {
      var p = Page.usedPos.splice(idx, 1);
      Page.freePos.push(p);
    }
  });
}());
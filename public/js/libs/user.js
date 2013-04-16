var User = Object.create({}, {
  _private : {
    writable : false,
    enumerable: false,
    configurable: true,
    value : {}
  },
  // user name
  name : {
    set : function(val) {
      this._private.name = val;
      return this;
    },
    get : function() {
      return this._private.name || '';
    },
    enumerable: true
  },
  // user id, perhaps equal to socket id
  uid : {
    set : function(val) {
      this._private.uid = val;
      return this;
    },
    get : function() {
      return this._private.uid || 0;
    },
    enumerable: true
  },
  // current socket id
  sid : {
    set : function(val) {
      this._private.sid = val;
      return this;
    },
    get : function() {
      return this._private.sid || 0;
    },
    enumerable: true
  },
  // user head img url
  headurl : {
    set : function(val) {
      this._private.headurl = val;
      return this;
    },
    get : function() {
      return this._private.headurl || 0;
    },
    enumerable: true
  },
  // is User visiable
  visiable : {
    set : function(val) {
      this._private.visiable = !!val;
      return this;
    },
    get : function() {
      return this._private.visiable || false;
    },
    enumerable: true
  },
  // this user's postion
  pos : {
    set : function(val) {
      this._private.pos = Object.create(this._private.pos, val);
      return this;
    },
    get : function() {
      return this._private.pos || {x : 0, y : 0, alpha : 0, length : 0};
    },
    enumerable: true,
    value : {x : 0, y : 0, alpha : 0, length : 0}
  },
  // 用户对应的 dom 结点
  dom : {
    set : function(val) {
      this._private.dom = val;
      return this;
    },
    get : function() {
      return this._private.dom || null;
    },
    enumerable: true
  },

  init : {
    value : function(options) {
      this._private = Object.create(this._private, options);
      return this;
    }
  },
  show : {
    value : function() {
      var clsn = " " + this._private.dom.className.trim() + " ";
      clsn = clsn.replace(/ hide /g, ' ').trim();
      clsn.split(' ');
      clsn.push('show');
      this._private.dom.className = clsn.join(' ');
    }
  },
  hide : {
    value : function() {
      var clsn = " " + this._private.dom.className.trim() + " ";
      clsn = clsn.replace(/ show /g, ' ').trim();
      clsn.split(' ');
      clsn.push('hide');
      this._private.dom.className = clsn.join(' ');
    }
  }
});
(function () {
  var event_property = { writable: false, enumerable: false},
    private_property = { writable: true, enumerable: false, configurable: true};

  window.UserProfile = Object.create({}, {
    name: Object.create(private_property, {value: { value: ''}}),
    uid: Object.create(private_property, {value: { value: ''}}),
    sid: Object.create(private_property, {value: { value: ''}}),
    headurl: Object.create(private_property, {value: { value: ''}}),
    visiable: Object.create(private_property, {value: { value: false}}),
    pos: Object.create(private_property, {value: { value: {x:0,y:0,alpha:0,length:0}}}),
    dom: Object.create(private_property, {value: { value: null}})
  });

  window.User = Object.create({}, {
    _private: {
      writable: false,
      enumerable: false,
      configurable: true,
      value: Object.create(UserProfile)
    },
    _events: {writable: false, enumerable: false, configurable: true, value: {}},
    _EVENT_BEFORE_SHOW: Object.create(event_property, {value: {value: 'beforeshow'}}),
    _EVENT_AFTER_SHOW: Object.create(event_property, {value: {value: 'aftershow'}}),
    _EVENT_BEFORE_HIDE: Object.create(event_property, {value: {value: 'beforehide'}}),
    _EVENT_AFTER_HIDE: Object.create(event_property, {value: {value: 'afterhide'}}),
    _EVENT_BEFORE_POS_CHANGE: Object.create(event_property, {value: {value: 'beforeposchange'}}),
    _EVENT_AFTER_POS_CHANGE: Object.create(event_property, {value: {value: 'afterposchange'}}),
    _EVENT_BEFORE_NAME_CHANGE: Object.create(event_property, {value: {value: 'beforenamechange'}}),
    _EVENT_AFTER_NAME_CHANGE: Object.create(event_property, {value: {value: 'afternamechange'}}),
    _EVENT_BEFORE_SID_CHANGE: Object.create(event_property, {value: {value: 'beforesidchange'}}),
    _EVENT_AFTER_SID_CHANGE: Object.create(event_property, {value: {value: 'aftersidchange'}}),
    _trigger: {
      value: function (event) {
        event = typeof event == 'object' ? event.value : event;
        if (!(event in this._events)) {
          console.log('event is not exists', event);
          return;
        }
        var e = {
          type: event,
          target: this
        }, _self = this;
        this._events[event].forEach(function (func) {
          (func.bind(_self))(e);
        })
      }
    },
    // user name
    name: {
      set: function (val) {
        if (this._private.name == val) {
          return this;
        }
        this._trigger(this._EVENT_BEFORE_NAME_CHANGE);
        this._private.name = val;
        this._trigger(this._EVENT_AFTER_NAME_CHANGE);
        return this;
      },
      get: function () {
        return this._private.name || '';
      },
      enumerable: true,
      configurable: false
    },
    // user id, perhaps equal to socket id
    uid: {
      set: function (val) {
        this._private.uid = val;
        return this;
      },
      get: function () {
        return this._private.uid || 0;
      },
      enumerable: true
    },
    // current socket id
    sid: {
      set: function (val) {
        this._private.sid = val;
        return this;
      },
      get: function () {
        return this._private.sid || 0;
      },
      enumerable: true
    },
    // user head img url
    headurl: {
      set: function (val) {
        this._private.headurl = val;
        return this;
      },
      get: function () {
        return this._private.headurl || 0;
      },
      enumerable: true
    },
    // is User visiable
    visiable: {
      set: function (val) {
        this._private.visiable = !!val;
        return this;
      },
      get: function () {
        return this._private.visiable || false;
      },
      enumerable: true
    },
    // this user's postion
    pos: {
      set: function (val) {
        var _self = this;
        var equal = true;
        var keys = Object.keys(this._private.pos);
        keys.forEach(function (key) {
          if (!(key in val) || val[key] != _self._private.pos[key]) {
            equal = false;
          }
        });
        if (equal) {
          return this;
        }
        _self = equal = keys = null;
        this._trigger(this._EVENT_BEFORE_POS_CHANGE);
        for(var i in val) {
          if(val.hasOwnProperty(i)){
            val[i] = {
              value : val[i]
            }
          }
        }
        this._private.pos = Object.create(this._private.pos, val);
        this._trigger(this._EVENT_AFTER_POS_CHANGE);
        return this;
      },
      get: function () {
        return this._private.pos || {x: 0, y: 0, alpha: 0, length: 0};
      },
      enumerable: true
    },
    // 用户对应的 dom 结点
    dom: {
      set: function (val) {
        this._private.dom = val;
        return this;
      },
      get: function () {
        return this._private.dom || null;
      },
      enumerable: true
    },
    show: {
      value: function () {
        this._trigger(this._EVENT_BEFORE_SHOW);
        var clsn = " " + this._private.dom.className.trim() + " ";
        clsn = clsn.replace(/ hide(?=\s)/g, '').trim();
        clsn = clsn.split(' ');
        clsn.push('show');
        this._private.dom.className = clsn.join(' ');
        this._trigger(this._EVENT_AFTER_SHOW);
      }
    },
    hide: {
      value: function () {
        this._trigger(this._EVENT_BEFORE_HIDE);
        var clsn = " " + this._private.dom.className.trim() + " ";
        clsn = clsn.replace(/ show(?=\s)/g, '').trim();
        clsn = clsn.split(' ');
        clsn.push('hide');
        this._private.dom.className = clsn.join(' ');
        this._trigger(this._EVENT_AFTER_HIDE);
      }
    },
    on: {
      value: function (event, func) {
        if (!(event in this._events)) {
          this._events[event] = []
        }
        this._events[event].push(func);
        return this;
      },
      writable: false
    },
    off: {
      value : function(event, func) {
        if (!(event in this._events)) {
          return this;
        }
        this._events[event].splice(this._events[event].indexOf(func), 1);
        return this;
      },
      writable:false
    }
  });
}());

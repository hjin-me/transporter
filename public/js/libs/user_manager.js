/**
 * Created with JetBrains PhpStorm.
 * User: hjin
 * Date: 13-4-17
 * Time: PM5:42
 * To change this template use File | Settings | File Templates.
 */
(function(){
  var event_property = { writable: false, enumerable: false},
    private_property = { writable: true, enumerable: false, configurable: true};
  var UserManager = function() {
    this.userList = {};
    this.used = [];
    this.free = [];
    this._events = {};
    this._EVENT_BEFORE_ADDUSER = Object.create(event_property, {value: {value: 'beforeadduser'}});
    this._EVENT_AFTER_ADDUSER = Object.create(event_property, {value: {value: 'afteradduser'}});
    this._EVENT_BEFORE_REMOVEUSER = Object.create(event_property, {value: {value: 'beforeremoveuser'}});
    this._EVENT_AFTER_REMOVEUSER = Object.create(event_property, {value: {value: 'afterremoveuser'}});
    this._trigger = function(event, ext) {
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
        (func.bind(_self))(e, ext);
      })
    };
    this.on = function(event, func) {
      if (!(event in this._events)) {
        this._events[event] = []
      }
      this._events[event].push(func);
      return this;
    }
  };
  UserManager.prototype.addUser = function(user) {
    if(typeof user == 'object') {
      this._trigger(this._EVENT_BEFORE_ADDUSER);

      this.userList[user.uid] = user;
      this.free.push(user.uid);
      this._trigger(this._EVENT_AFTER_ADDUSER);
      return this;
    } else {
      return false;
    }
  };
  UserManager.prototype.removeUser = function(user) {
    var res, uid = '', sid;
    if(typeof user == 'string') {
      sid = user;
      for(var i in this.userList) {
        if(!this.userList.hasOwnProperty(i)) {
          continue;
        }
        if(this.userList[i].sid == sid) {
          uid = this.userList[i].uid;
        }
      }
    }
    if(typeof user == 'object') {
      uid = user.uid;
    }
    this._trigger(this._EVENT_BEFORE_REMOVEUSER, this.userList[uid]);
    this.userList[uid].hide();
    res = delete this.userList[uid];

    if(this.free.indexOf(uid) > -1) {
      this.free.splice(this.free.indexOf(uid), 1);
    }
    if(this.used.indexOf(uid) > -1) {
      this.used.splice(this.used.indexOf(uid), 1);
    }
    this._trigger(this._EVENT_AFTER_REMOVEUSER);
    return res;
  };
  UserManager.prototype.useOneUser = function() {
    var uid = this.free.shift();
    this.used.push(uid);
    return this.userList[uid];
  };
  UserManager.prototype.freeOneUser = function(user) {
    var uid = '';
    if(typeof user == 'string') {
      uid = user
    }
    if(user instanceof User) {
      uid = user.uid;
    }

    var ret = this.used.indexOf(uid);
    if(ret > -1) {
      this.used.splice(ret, 1);
      this.free.push(uid);
    }
  };

  window.UserManager = new UserManager();
}());
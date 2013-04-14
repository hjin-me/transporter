var UserList = function(config) {
  config = config || {};
  this.users = {};
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

UserList.prototype.reload = function() {

};
UserList.prototype.import = function(userlist) {
  for(var i in userlist) {
    if(userlist.hasOwnProperty(i)) {
      this.add({
        id : i,
        name : userlist[i]
      })
    }
  }
};
UserList.prototype.add = function(user) {
  this.users[user.id] = user.name;
};
UserList.prototype.buildUserList = function() {

};
/**
 * 渲染一组用户
 * @param {{after : String, before : String}} [config]
 */
UserList.prototype.render = function(config) {
  config = config || {after: false, before: false};
  function tpl(data) {
    return '<div class="person circle user hide" style="left:' + data.left + 'px;top:' + data.top + 'px;" data-sid="' +
      data.sid+ '" data-user="' + data.user + '"></div>'
  }
  var html = '', first, last = false;
  var uidArr = Object.keys(this.users);
  uidArr.sort();

  var rawFirst = uidArr[0], rawLast = uidArr[uidArr.length - 1];

  if(config.after) {
    uidArr = uidArr.splice(uidArr.indexOf(config.after) + 1);
  }

  if(config.before) {
    uidArr = uidArr.splice(0, uidArr.indexOf(config.before));
    uidArr.reverse();
  }

  first = uidArr[0];
  for(var i = 0; i < uidArr.length; i ++) {
    var p = this.cp.getPos(60);
    if(!p) {
      // 没有足够空间来插入新的元素了
      break;
    }
    last = uidArr[i];
    html += tpl({
      sid : uidArr[i],
      user : this.users[uidArr[i]],
      left : p.x,
      top : p.y
    });
  }

  if(config.before) {
    var t = last;
    last = first;
    first = t;
    t = null;
  }

  if(first != rawFirst) {
    // 只有当第一个元素不真实的第一个元素时，才记录 first 元素的 id
    this.current.first = first;
  } else {
    this.current.first = false;
  }
  if(last != rawLast) {
    // 只有当出现页面塞不下的情况，才记录 last 元素的 id
    this.current.last = last;
  } else {
    this.current.last = false;
  }


  this.container.innerHTML = html;
};
UserList.prototype.show = function() {
  var nodelist = this.container.querySelectorAll('.hide');
  nodelist = [].slice.call(nodelist);
  var interval = 100;
  var user_count = nodelist.length;
  nodelist.forEach(function(el){

    var classnames = (" " +el.className.trim() + " ").replace(/ hide /g, ' ').trim().split(' ');
    classnames.push('show');

    var elChange = changeClass(el, classnames.join(' '));
    setTimeout(elChange, interval * Math.ceil(Math.random() * user_count));
  });

  function changeClass(el, classname) {
    return function() {
      el.className = classname;
    }
  }
};
UserList.prototype.hide = function() {
  var nodelist = this.container.querySelectorAll('.show');
  nodelist = [].slice.call(nodelist);
  nodelist.forEach(function(el){
    var classnames = (" " +el.className.trim() + " ").replace(/ show /g, ' ').trim().split(' ');
    classnames.push('hide');
    el.className = classnames.join(' ');
  })
};
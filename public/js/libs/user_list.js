var UserList = function(config) {
  config = config || {};
  this.users = {};
  this.container = document.querySelector(config.container || '#users');
  this.cp = new CirclePosition({
    x : this.container.offsetWidth / 2 + 30,
    y : this.container.offsetHeight
  });

};

UserList.prototype.reload = function() {

};
UserList.prototype.add = function(user) {
  this.users[user.id] = user.name;
};
UserList.prototype.render = function() {
  function tpl(data) {
    return '<div class="person circle user hide" style="left:' + data.left + 'px;top:' + data.top + 'px;" data-sid="' +
      data.sid+ '" data-user="' + data.user + '"></div>'
  }
  var html = '';
  for(var i in this.users) {
    if(!this.users.hasOwnProperty(i)) {
      continue;
    }
    var p = this.cp.getPos();
    html += tpl({
      sid : i,
      user : this.users[i],
      left : p.x,
      top : p.y
    });
  }
  this.container.innerHTML = html;
};
UserList.prototype.show = function() {
  var nodelist = this.container.querySelectorAll('.hide');
  nodelist = [].slice.call(nodelist);
  nodelist.forEach(function(el){
    var classnames = (" " +el.className.trim() + " ").replace(/ hide /g, ' ').trim().split(' ');
    classnames.push('show');
    el.className = classnames.join(' ');
  })
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
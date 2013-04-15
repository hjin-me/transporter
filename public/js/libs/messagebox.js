/**
 * Created with JetBrains PhpStorm.
 * User: hjin
 * Date: 13-4-15
 * Time: PM7:36
 * To change this template use File | Settings | File Templates.
 */
/**
 * MessageBox
 * @constructor
 */
var MessageBox = function(){
  this.tpl = function(data) {
    var tplArr = [];
    tplArr.push('<div class="message_box">');
    tplArr.push('<header><h3>' + data.title + '</h3></header>');
    tplArr.push('<section><p>' + data.message + '</p></section>');
    tplArr.push('<footer><button class="confirm">确认</button><button class="refuse">取消</button></footer>');
    tplArr.push('</div>');
    return tplArr.join('');
  }
};
MessageBox.prototype.close = function() {
  var container = document.querySelector('.message_box_container');
  if(container) {
    container.innerHTML = '';
  }
};

MessageBox.prototype.alert = function(message, title, ok) {
  var _self = this;
  var container = document.querySelector('.message_box_container');
  if(!container) {
    container = document.createElement('div');
    container.className = 'message_box_container';
    document.getElementsByTagName('body')[0].appendChild(container);
  }

  container.innerHTML = this.tpl({
    title : title || '提示',
    message : message || '新消息'
  });
  var btn_refuse = container.querySelector('.refuse');
  if(btn_refuse) {
    btn_refuse.style.display = 'none';
  }

  ok = ok || function() {};

  container.addEventListener('click', clickEvent);

  function clickEvent(e) {
    if((' ' + e.target.className.trim() + ' ').indexOf('confirm')) {
      ok.call(_self);
    }
    container.innerHTML = '';
    container.removeEventListener('click', clickEvent);
  }
};

MessageBox.prototype.confirm = function(message, title, ok, cancel) {
  var _self = this;
  var container = document.querySelector('.message_box_container');
  if(!container) {
    container = document.createElement('div');
    container.className = 'message_box_container';
    document.getElementsByTagName('body')[0].appendChild(container);
  }

  container.innerHTML = this.tpl({
    title : title || '提示',
    message : message || '确认？'
  });

  ok = ok || function() {};
  cancel = cancel || function() {};

  container.addEventListener('click', clickEvent);

  function clickEvent(e) {
    if((' ' + e.target.className.trim() + ' ').indexOf('confirm') > -1) {
      ok.call(_self);
      _self.close();
      container.removeEventListener('click', clickEvent);
    }
    if((' ' + e.target.className.trim() + ' ').indexOf('refuse') > -1) {
      cancel.call(_self);
      _self.close();
      container.removeEventListener('click', clickEvent);
    }

  }
};
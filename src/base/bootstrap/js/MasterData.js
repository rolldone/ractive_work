import debounce from 'lodash/debounce';

/* Share master data */
window.masterData = {
  record_url : null,
  pending: {},
  vars: {},
  listeners : {},
  // listenerName, callback,key="",callOnInit=false
  setOnListener: function () {
    if(this.resetListener()==false) return;
    let listenerName = arguments[0];
    let callback = arguments[1];
    let arg2 = arguments[2];
    arg2 = arg2==null?"":arg2;
    let arg3 = arguments[3] || null;
    // let key = Object.prototype.toString.call(arg2)=='[object Boolean]'?'':arg2;
    // let callOnInit = Object.prototype.toString.call(arg2)=='[object String]'?arg3==null?false:arg3:arg2;
    let key = typeof arg2 == "boolean" ?'':arg2;
    let callOnInit = typeof arg2 == "string" ?arg3==null?false:arg3:arg2;
    var newKey = listenerName+key;
    var newListenerKey = listenerName+callback.toString();
    if(this.listeners[newListenerKey] != null){
      global.pubsub.removeListener(newKey,this.listeners[newListenerKey]);
      delete this.listeners[newListenerKey];
    }
    this.listeners[newListenerKey] = callback;
    global.pubsub.on(newKey, this.listeners[newListenerKey]);
    if(callOnInit == true){
      global.pubsub.emit(newKey, this.vars[newKey]);
    }
    if(this.vars[newKey] != null){
      return this.vars[newKey];
    }
  },
  removeListener : function(listenerName,key){
    key = listenerName+key;
    global.pubsub.removeListener(listenerName,this.listeners[key]);
    delete this.listeners[key];
  },
  saveData: function (key, props, timeout=0) {
    if(this.resetListener()==false) return;
    this.vars[key] = props;
    if (this.pending[key] != null) {
      this.pending[key].cancel();
    }
    this.pending[key] = debounce(function (key, props) {
      global.pubsub.emit(key, props);
    }, timeout);
    this.pending[key](key, props);
  },
  updateData: function(key,props,timeout=0){
    let self = this;
    if(this.resetListener()==false) return;
    switch(true){
      case Object.prototype.toString.call(props)=='[object Object]':
        this.vars[key] = {
          ...this.vars[key],
          ...props
        }
        break;
      default:
        this.vars[key] = props;
        break;
    }
    
    if (this.pending[key] != null) {
      this.pending[key].cancel();
    }
    this.pending[key] = debounce(function (key, props) {
      global.pubsub.emit(key, self.vars[key] );
    }, timeout);
    this.pending[key](key, props);
  },
  resetListener : function(){
    if(window == undefined){
      return false;
    }
    if(this.record_url != window.location.href){
      this.record_url = window.location.href;
    }else{
      return;
    }
    for(var key in this.vars){
      for(var keyListeners in this.listeners){
        if(keyListeners.indexOf(key, 0) == 0){
          global.pubsub.removeListener(key,this.listeners[keyListeners]);
        }
      }
    }
  },
  getData: function(key, exceptionProps){
    let data = this.vars[key];
    data = {
      ...exceptionProps,
      ...this.vars[key]
    }
    this.vars[key] = data;
    return this.vars[key];
  },
  run : function(){
    console.log('This function deprecated!');
  }
}

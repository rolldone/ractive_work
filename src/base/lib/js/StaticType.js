let theWIndow = null;
if(process != null){
  if(process.browser == true){
    theWIndow = window;
  }
}

(function(global){
  var typeVariable = function(){
    var types = {
      'get': function(prop) {
         return Object.prototype.toString.call(prop);
      },
      'null': '[object Null]',
      'object': '[object Object]',
      'array': '[object Array]',
      'string': '[object String]',
      'boolean': '[object Boolean]',
      'number': '[object Number]',
      'date': '[object Date]',
      'function': '[object Function]',
      'mouseevent': '[object MouseEvent]',
      'keyboardevent': '[object KeyboardEvent]'
    };
    return {
      check : function(props){
        return types.get(props);
      },
      types
    };
  };
  /* Static Type check allowed type data */
  let staticType = function (inVariable, typeDatas = [],debug=false) {
    var isWRong = true;
    var closureCondition = function (theVariable, arrayRecordTypeOf) {
      return function (typeDataItem) {
        if(typeDataItem == null){
          typeDataItem = "Null";
        }else{
          typeDataItem = typeDataItem.name+'';
        }
        if(theVariable == undefined){
          theVariable = null;
        }
        var getType = typeVariable();
        if(debug == true){
          debugger;
        }
        if(debug == true){
          debugger;
        }
        let result = false;
        switch(true){
          case typeDataItem.toLowerCase() == 'null':
            result = getType.check(theVariable) == getType.types.null;
            if(result == false){
              arrayRecordTypeOf.push(typeDataItem);
            }
            return result;
          case typeDataItem.toLowerCase() == 'function':
            result = getType.check(theVariable) == getType.types.function;
            if(result == false){
              arrayRecordTypeOf.push(typeDataItem);
            }
            return result;
          case typeDataItem.toLowerCase() == 'object':
            result = getType.check(theVariable) == getType.types.object;
            if(result == false){
              arrayRecordTypeOf.push(typeDataItem);
            }
            return result;
          case typeDataItem.toLowerCase() == 'array':
            result = getType.check(theVariable) == getType.types.array;
            if(result == false){
              arrayRecordTypeOf.push(typeDataItem);
            }
            return result;
          case typeDataItem.toLowerCase() == 'string':
            result = getType.check(theVariable) == getType.types.string;
            if(result == false){
              arrayRecordTypeOf.push(typeDataItem);
            }
            return result;
          case typeDataItem.toLowerCase() == 'boolean':
            result = getType.check(theVariable) == getType.types.boolean;
            if(result == false){
              arrayRecordTypeOf.push(typeDataItem);
            }
            return result;
          case typeDataItem.toLowerCase() == 'number':
            result = getType.check(theVariable) == getType.types.number;
            if(result == false){
              arrayRecordTypeOf.push(typeDataItem);
            }
            return result;
          case typeDataItem.toLowerCase() == 'date':
            result = getType.check(theVariable) == getType.types.date;
            if(result == false){
              arrayRecordTypeOf.push(typeDataItem);
            }
            return result;
          case getType.types[typeDataItem.toLowerCase()] != null:
            return getType.check(theVariable) == getType.types[typeDataItem.toLowerCase()];
          default:
            if(getType.types[typeDataItem.toLowerCase()] == undefined){
              getType.types[typeDataItem.toLowerCase()] = getType.check(theVariable);
              if(debug == true){
                console.log(typeDataItem,getType.types[typeDataItem.toLowerCase()]);
                debugger;
              }
              result = getType.check(theVariable) == getType.types[typeDataItem.toLowerCase()];
              if(result == false){
                arrayRecordTypeOf.push(typeDataItem);
              }
              return result;
            }else{
              arrayRecordTypeOf.push(typeDataItem);
            }
            break;

        }
      };
    };
    var recordTypeOf = [];
    var doCheckStaticType = closureCondition(inVariable, (recordTypeOf = []));
    if(debug == true){
      debugger;
    }
    for (var a = 0; a < typeDatas.length; a++) {
      let ttt = doCheckStaticType(typeDatas[a]);
      if(debug == true){
        debugger;
      }
      if ( ttt == true) {
        isWRong = false;
        break;
      }
    }
    if (isWRong == true) {
      var messageError = `StaticType Validation - value "${inVariable}" is Wrong type of variable, the requirement is ${JSON.stringify(recordTypeOf)}`;
      console.error("staticType - error ", messageError);
      throw new Error(messageError);
    }
    if(debug == true){
      debugger;
    }
  };
  if (typeof define === 'function' && define.amd) {
    /* AMD support */
    define(function(){
      return staticType;
    });
  } else if (typeof module === 'object' && module.exports) {
    /* CJS support */
    module.exports = staticType;
  } else {
    /** @namespace
     * staticType is the root namespace for all staticType.js functionality.
     */
    global.StaticType = staticType;
  }
})(theWIndow);
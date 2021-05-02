import StaticType from './StaticType';
import { debounce } from 'lodash';
import Validator from './validatorjs/validator';

let theWIndow = null;
if(process != null){
  if(process.browser == true){
    theWIndow = window;
  }
}

(function(global){
  var smartValidation = function(idSelector){
    StaticType(idSelector,[String,HTMLDivElement]);
    var id = idSelector;
    if(Object.prototype.toString.call(idSelector) == '[object String]'){
      id = '#'+id;
    }
    return {
      privSubmitValidation: function(props, callback) {
        let self = this;
        self.isPending = debounce(function(form_data) {
          let validation = new Validator(form_data, props.form_rules);
          let attributeName = props.form_attribute_name || self.get("form_attribute_name");
          if (Object.keys(attributeName).length > 0) {
            validation.setAttributeNames(attributeName);
          }
          validation.passes(function() {
            callback({
              status: "complete",
              form_data: form_data,
              error: {},
            });
          });
          validation.fails(function() {
            let newError = {};
            for (var aa in form_data) {
              switch (form_data[aa]) {
                case "":
                case null:
                  delete form_data[aa];
                  break;
              }
            }
            if (validation.errors.errors != null) {
              for (let key in validation.errors.errors) {
                newError[key] = validation.errors.errors[key][0];
                delete form_data[key];
              }
              callback({
                status: "error",
                form_data: form_data,
                error: newError,
              });
            } else {
              callback({
                status: "valid",
                form_data: form_data,
                error: newError,
              });
            }
          });
        }, 500);
        self.isPending(props.form_data);
      },
      privInputTextValidation: function(wrapperTarget, props, callback) {
        let self = this;
        console.log("props.form_data", props.form_data);
        let theDomParent = $(wrapperTarget);
        let theDom = theDomParent.find(props.element_target);
        theDom.each(function(index, dom) {
          $(dom).on("focus change keyup blur keydown", function(e) {
            if (self.isPending != null) {
              if (e.type != "blur") {
                self.isPending.cancel();
              }
            }
            self.isPending = debounce(function(key, value) {
              let newObject = {};
              newObject[key] = value;
              props.form_data = _.assign({}, props.form_data, newObject);
              for (var aa in props.form_data) {
                if (props.form_data[aa] == null || props.form_data[aa] == "") {
                  delete props.form_data[aa];
                }
                if (aa == "") {
                  delete props.form_data[aa];
                }
              }
              let validation = new Validator(props.form_data, props.form_rules);
              let attributeName = props.form_attribute_name || self.get("form_attribute_name");
              if (Object.keys(attributeName).length > 0) {
                validation.setAttributeNames(attributeName);
              }
              validation.passes(function() {
                callback(
                  {
                    status: "complete",
                    form_data: props.form_data,
                    error: {},
                    message: "",
                  },
                  e
                );
              });
              validation.fails(function() {
                let newError = {};
                if (validation.errors.errors[key]) {
                  newError[key] = validation.errors.errors[key][0];
                  callback(
                    {
                      status: "error",
                      form_data: props.form_data,
                      error: newError,
                      message: validation.errors.errors[key][0],
                    },
                    e
                  );
                } else {
                  callback(
                    {
                      status: "valid",
                      form_data: props.form_data,
                      error: newError,
                      message: "",
                    },
                    e
                  );
                }
              });
            }, 300);
            self.isPending(e.target.name, e.target.value);
          });
        });
      },
      inputTextValidation : function(props){
        let self = this;
        StaticType(props, [Object]);
        StaticType(props.form_attribute_name, [null, Object]);
        StaticType(props.form_data, [null, Object]);
        StaticType(props.form_rules, [null, Object]);
        StaticType(props.element_target, [null, String]);
        StaticType(props.callback,[Function]);
        self.privInputTextValidation(
          id,
          {
            form_data: props.form_data || self.get('form_data'),
            form_rules: props.form_rules || self.get('form_rules'),
            form_attribute_name: props.form_attribute_name || self('form_attribute_name'),
            element_target: props.element_target || "input[type=email],input[type=text],input[type=number]",
          },
          function(res, e) {
            console.log('res',res);
            return props.callback(res,e);
            /* Example set error notif validation on form */
            let parent = $(e.target)
              .parents(".field")
              .first();
            switch (res.status) {
              case "error":
                return parent.find("span.error").text(res.message);
              case "valid":
              case "complete":
                return parent.find("span.error").text("");
            }
          }
        );
      } ,
      inputPasswordValidation : function(props){
        let self = this;
        StaticType(props, [Object]);
        StaticType(props.form_attribute_name, [null, Object]);
        StaticType(props.form_data, [null, Object]);
        StaticType(props.form_rules, [null, Object]);
        StaticType(props.callback,[Function]);
        self.privInputTextValidation(
          id,
          {
            form_data: props.form_data || self.get('form_data'),
            form_rules: props.form_rules || self.get('form_rules'),
            form_attribute_name: props.form_attribute_name || self.get('form_attribute_name'),
            element_target: "input[type=password]",
          },
          function(res, e) {
            console.log('INPUT_PASSWORD_VALIDATION',res);
            return props.callback(res,e);
            /* Example set error notif validation on form */
            let parent = $(e.target)
              .parents(".field")
              .first();
            switch (res.status) {
              case "error":
                return parent.find("span.error").text(res.message);
              case "valid":
              case "complete":
                return parent.find("span.error").text("");
            }
          }
        );
      },
      submitValidation : function(props){
        let self = this;
        StaticType(props, [Object]);
        StaticType(props.form_attribute_name, [null, Object]);
        StaticType(props.form_data, [null, Object]);
        StaticType(props.form_rules, [null, Object]);
        StaticType(props.callback, [null, Function]);
        self.privSubmitValidation(
          {
            form_data: props.form_data,
            form_rules: props.form_rules,
            form_attribute_name: props.form_attribute_name,
          },
          function(res) {
            console.log("res", res);
            return props.callback(res);
            /* Example set error notif validation on form */
            let parent = $("#" + props.id);
            window.eachObject(res.error, function(i, key, val) {
              switch (key) {
                default:
                  var message = parent
                    .find(`input[name=${key}]`)
                    .parents(".field")
                    .first();
                  message.find("span.error").text(val);
                  break;
              }
            });
            window.eachObject(res.form_data, function(i, key, vak) {
              switch (key) {
                default:
                  var message = parent
                    .find(`input[name=${key}]`)
                    .parents(".field")
                    .first();
                  message.find("span.error").text("");
                  break;
              }
            });
            if (res.status == "complete") {
              if (props.callback == null) return;
              props.callback();
            }
          }
        );
      }
    };
  };

  if (typeof define === 'function' && define.amd) {
    /* AMD support */
    define(function(){
      return smartValidation;
    });
  } else if (typeof module === 'object' && module.exports) {
    /* CJS support */
    module.exports = smartValidation;
  } else {
    /** @namespace
     * SmartPushState is the root namespace for all SmartPushState.js functionality.
     */
    global.SmartPushState = smartValidation;
  }
})(theWIndow);
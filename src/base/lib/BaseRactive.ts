// import Ractive, {Static, ExtendOpts} from 'ractive';
import Ractive from './js/Ractive';
import Arg from './Arg';
import * as asyncjs from 'async';
import _ from 'lodash';
import { MyWindow } from '../@types';

declare var window: MyWindow;
const config = process.env;

const BaseRactive = Ractive.extend({
  data: function () {
    return {
      query: {},
      form_attribute_name: {},
    };
  },
  onconstruct: function () {
    this._super();
    this.reInitializeObserve();
  },
  oninit: function () {
    this.setQuery();
  },
  reInitializeObserve: function() {
    let self: any = this;
    for (var key in self.newOn) {
      self.off(key);
      self.on(key, self.newOn[key]);
    }
  },
  findComponentByRef: function (ref: string) {
    window.staticType(ref, [String]);
    let passComponentHash: any = window.componentsHash;
    return passComponentHash[ref];
  },
  validURL: function (str: string) {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(str);
  },
  safeJSON: function (props: object, endpoint: string, defaultValue: any | null = null, index: number | null) {
    let passEndPoint: any = endpoint;
    let passProps: any = props;
    passEndPoint = passEndPoint.split(".");
    if (passEndPoint.length == 0) {
      return defaultValue;
    }
    if (index == null) {
      index = 0;
    }
    if (passProps == null) {
      return defaultValue;
    }
    if (passProps[passEndPoint[index]] == null) {
      return defaultValue;
    }
    passProps = passProps[passEndPoint[index]];
    index += 1;
    if (index == passEndPoint.length) {
      return passProps;
    }
    return this.safeJSON(passProps, passEndPoint.join("."), defaultValue, index);
  },
  removePropertyByPrefix: function (key: string, props: object) {
    let newProps: any = props;
    for (var a in newProps) {
      if (a.includes(key) == true) {
        delete newProps[a];
      }
    }
    return newProps;
  },
  mergeObjectAndFormData: function (props: object, domFormElement: HTMLFormElement) {
    let passProps: any = props;
    let formData: any = new FormData(domFormElement);
    let result: any = {};
    for (var entry of formData.entries()) {
      result[entry[0]] = entry[1];
    }
    passProps = Object.assign(result, passProps);
    return passProps;
  },
  objectToFormData: function (props: object) {
    let passProps: any = props;
    let formData = null;
    formData = new FormData();
    for (var a in passProps) {
      if (passProps[a] != null) {
        formData.append(a, passProps[a]);
      }
    }
    return formData;
  },
  removePrefix: function (key: string, props: object) {
    let passProps: any = props;
    for (var a in passProps) {
      if (passProps[a] != "") {
        let val = passProps[a];
        delete passProps[a];
        a = a.replace(key, "");
        passProps[a] = val;
      } else {
        delete passProps[a];
      }
    }
    return passProps;
  },
  getValuePrefix: function (key: string, props: object) {
    let passProps: any = props;
    let theValue: any = {};
    for (var a in passProps) {
      if (a.includes(key) == true) {
        theValue[a] = passProps[a];
      }
    }
    return theValue;
  },
  setUrl: function (urlString: string, array: Array<object>) {
    let passArray: Array<any> = array;
    for (var a = 0; a < passArray.length; a++) {
      for (var key in passArray[a]) {
        if (urlString.match(key)) {
          var re = new RegExp(key, "g");
          urlString = urlString.replace(re, passArray[a][key]);
        }
      }
    }
    return urlString;
  },
  setUpdate: function (key: string, props: object, mode: string | null = null) {
    let self = this;
    let passProps: any = props;
    return new Promise(async (resolve: Function) => {
      let currentData = self.get(key) || {};
      console.log("currentData -> ", currentData);
      if (mode == "sequential") {
        switch (Object.prototype.toString.call(passProps)) {
          case '[object Object]':
            for (var keyItem in passProps) {
              await self.set(key + '.' + keyItem, passProps[keyItem]);
            }
            break;
          default:
            await self.set(key, passProps);
            break;
        }
      } else {
        await self.set(key, {
          ...currentData,
          ...passProps
        });
      }

      resolve();
    });
  },
  /** 
   * Ini untuk add dan append tanpa duplicate data
   */
  initSelectedData: function (whatId: string, theArray: Array<any>) {
    let theSelectedData = theArray;
    let is_same = false;
    theSelectedData.forEach(function (item, i) {
      if (item == whatId) {
        is_same = true;
        theSelectedData.splice(i, 1);
      } else {
      }
    });
    if (!is_same) {
      theSelectedData.push(whatId);
    }
    return theSelectedData;
  },
  /**
   * Ini untuk type key object lebih bagus dari initSelectedData 
   */
  initSelectedDataKey: function (whatId: string, theObject: object, isChecked: boolean = false) {
    let theSelectedData: any = theObject;
    if (theSelectedData[whatId] == null) {
      if (isChecked == true) {
        theSelectedData[whatId] = whatId;
      }
      return theSelectedData;
    }
    if (isChecked == false) {
      delete theSelectedData[whatId];
    }
    return theSelectedData;
  },
  setTitle: function (whatTitle: string) {
    this.root.findComponent("head-menu").setHeader("page_name", whatTitle);
  },
  show: function () {
    alert("need to overriding");
  },
  hide: function () {
    alert("need to overriding");
  },
  jsonParseUrl: function (whatUrl = window.location.href) {
    let theUrl = new Arg(whatUrl);
    let theJSON: any = {};
    theJSON["query"] = theUrl.query();
    theJSON["hash"] = theUrl.hash();
    return theJSON;
  },
  jsonToQueryUrl: function (url: string, whatObject: object, action: string) {
    let theArg = new Arg();
    if (action == "hash") {
      theArg.urlUseHash = true;
    }
    let theUrl = theArg.url(url, whatObject);
    return theUrl;
  },
  updateUrlState: function (curUrl: string, action: string | null) {
    // console.log(window.location.href,' - '+curUrl);
    switch (action) {
      case "PUSH_STATE":
        if (window.location.href == curUrl) {
          return;
        }
        return window.history.pushState("", "", curUrl);
    }
    return window.history.replaceState("", "", curUrl);
    // window.router.update(curUrl,false,{});
  },
  saveQueryUrl: function (query: object, url: string | null = null, option: string | null = null) {
    let self = this;
    let newQuery = self.jsonToQueryUrl(url || window.location.href, query, null);
    self.updateUrlState(newQuery, option || "PUSH_STATE");
    return newQuery;
  },
  /* 
      Ini cocok untuk ketika data di salah satu pagination 
        number result empty maka lakukan recheck limit pagination kembali
        dengan yang baru 
  */
  recheckPaginationAfterEmpty: async function (lastPage: number) {
    let self = this;
    if (lastPage == 0) {
      return;
    }
    await self.set("page", lastPage);
    await self.set("limit_number", lastPage);
    let newUrlState = self.jsonToQueryUrl(
      window.location.href,
      {
        page: self.get("page"),
      },
      null
    );
    self.updateUrlState(newUrlState);
  },
  waitingDOMLoaded: function (selector: string, callback: Function) {
    let self = this;
    if ($(selector).length) {
      setTimeout(function () {
        callback();
      }, 1000);
    } else {
      setTimeout(function () {
        self.waitingDOMLoaded(selector, callback);
      }, 1000);
    }
  },
  waitingTimeout: function (whatSecondTime: number) {
    return new Promise(function (resolve: Function) {
      setTimeout(function () {
        resolve();
      }, whatSecondTime);
    });
  },
  handleCaptchaListener: function (dom_id: string, callback: Function) {
    let self = this;
    window.staticType(dom_id, [String]);
    window.staticType(callback, [Function]);
    try {
      self.grecaptcha = window.grecaptcha.render(dom_id, {
        sitekey: config.g_captcha_site_key,
        callback: function (response: any) {
          return callback(response);
          self.setUpdate("form_data", {
            recaptcha_token: response,
          });
        },
      });
    } catch (ex) {
      alert(ex.message);
    }
  },
  url: function (stringUrl: string) {
    let self = this;
    window.staticType(stringUrl, [String]);
    if (self.validURL(stringUrl) == true) {
      return stringUrl;
    }
    return config.BASE_PATH + stringUrl;
  },
  staticAsset: function (stringUrl: string) {
    window.staticType(stringUrl, [String]);
    return config.ASSET + stringUrl;
  },
  assetApiUrl: function (stringUrl: string) {
    window.staticType(stringUrl, [String]);
    return config.API_ASSET_URL + stringUrl;
  },
  dispatch: function (stringUrlOrName: string, props: {
    hash?: String,
    state?: Object,
    noHistory?: Boolean,
    query?: Object
  } = { noHistory: false }) {
    if (this.routeName(stringUrlOrName) != "") {
      stringUrlOrName = this.routeName(stringUrlOrName);
    }
    if (props != null) {
      var whattheUrl = stringUrlOrName;
      if (props.state != null) whattheUrl = this.setUrl(whattheUrl, [props.state]);
      if (props.query != null) whattheUrl = this.jsonToQueryUrl(whattheUrl, {
        ...props.query,
        _state: new Date().getMilliseconds()
      }, null);
      if (props.hash != null) whattheUrl = this.jsonToQueryUrl(whattheUrl, props.hash, "hash");
      stringUrlOrName = whattheUrl;
    }
    if (props.noHistory == null) {
      props.noHistory = false;
    }
    window.router.dispatch(stringUrlOrName, props);
  },
  routeName: function (whatRouteName: string, props: any = null) {
    if (props != null) {
      var whattheUrl = window.router.routeName(whatRouteName);
      if (props.state != null) whattheUrl = this.setUrl(whattheUrl, [props.state]);
      if (props.query != null) whattheUrl = this.jsonToQueryUrl(whattheUrl, props.query, null);
      if (props.hash != null) whattheUrl = this.jsonToQueryUrl(whattheUrl, props.hash, "hash");
      return whattheUrl;
    }
    return window.router.routeName(whatRouteName);
  },
  isRouteNameEqual: function (routeName: string) {
    window.staticType(routeName, [String]);
    let self = this;
    if (self.routeName(routeName) == window.location.pathname) {
      return true;
    }
    return false;
  },
  getConfig: function () {
    return config;
  },
  newOn: {},
  setTemplateData: function (whatVariable: string, value: any) {
    if (window.template_data == null) {
      window.template_data = {};
    }
    let self = window.template_data;
    self[whatVariable] = _.cloneDeep(value);
    console.log("whatVariable", whatVariable);
    console.log("value", value);
  },
  getTemplateData: function (whatVariable: string) {
    if (window.template_data == null) {
      window.template_data = {};
    }
    let self = window.template_data;
    return self[whatVariable];
  },
  setBindData: function (scope: string, value: string) {
    var test = document.querySelectorAll(`[data-binding="${scope}"]`); //.map(i => i.innerHTML = value);
    test.forEach(function (dom, i) {
      dom.innerHTML = value;
    });
    // document.querySelector(`[data-binding="${scope}"]`).innerHTML = value;
    // document.querySelector(`[data-model="${scope}"]`).value = value;
    // document.querySelector(`[data-model="${scope}"]`).value = value;
  },
  addQueue: function (whatFunction: Function, callback: Function) {
    let self = this;
    if (self.asyncJsQueue == null) {
      self.asyncJsQueue = [];
    }
    if (self.pendingAddQueue != null) {
      self.pendingAddQueue.cancel();
    }
    self.asyncJsQueue.push(function (props: Object, callback: Function) {
      return whatFunction.bind(self, props)(callback);
    });
    self.pendingAddQueue = _.debounce(function (callback: Function) {
      asyncjs.waterfall(self.asyncJsQueue, function (err: any, result: any) {
        self.asyncJsQueue = [];
        if (err) {
          if (callback != null) {
            return callback(err, null);
          }
        }
        if (callback != null) {
          return callback(null, result);
        }
      });
    }, 1000);
    self.pendingAddQueue(callback);
  },
  setQuery: function () {
    let self = this;
    let parseQuery = self.jsonParseUrl(window.location.href);
    self.setUpdate("query", parseQuery.query);
  },
  uniqueString: function () {
    let self = this;
    return '_' + Math.random().toString(36).substr(2, 9);
  }
});

/**
----------------------------------------
Define Base Component
------------- **/
BaseRactive.components.emptyComponent = BaseRactive.extend({});
BaseRactive.components.DynComponent = BaseRactive.extend({
  template: "<current-component/>",
  data: function () {
    return {
      name: <any>null,
    };
  },
  components: {
    "current-component": <any>function () {
      return this.get("name") || "emptyComponent";
    },
  },
  onconfig: function () {
    let self = this;
    self.observe(
      "name",
      function (val: string) {
        if (BaseRactive.components[val] == null) {
          console.log("component check -> ", val);
          throw new Error("Component Not Found, Please Check again your component");
        }
        self.reset();
      },
      { init: false }
    );
  }
});

export default BaseRactive;

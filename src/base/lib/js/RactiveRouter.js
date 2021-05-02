/*!
 * ractive-route 0.3.9
 * https://github.com/MartinKolarik/ractive-route/
 *
 * Copyright (c) 2014 - 2018 Martin Kolárik
 * martin@kolarik.sk
 * http://kolarik.sk
 *
 * Licensed under the MIT license
 * http://www.opensource.org/licenses/MIT
 */

(function(factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory(require("ractive"));
  } else if (typeof define === "function" && define.amd) {
    define(["ractive"], factory);
  } else {
    factory(global.Ractive);
  }
})(function(Ractive) {
  /**
   * Route
   *
   * @param {String} pattern
   * @param {Function} Handler
   * @param {Object} [observe]
   * @param {Object} [router]
   * @constructor
   * @public
   */
  function Route(pattern, Handler, observe, router) {
    this.pattern = pattern;
    this.map = parsePattern(pattern);
    this.regExp = patternToRegExp(pattern);
    this.strictRegExp = patternToStrictRegExp(pattern);
    this.isComponent = !!Handler.extend;
    this.Handler = Handler;
    this.observe = assign({ qs: [], hash: [], state: [] }, {
      ...observe,
      pattern : pattern
    });
    this.allObserved = this.observe.qs.concat(this.observe.hash, this.observe.state);
    this.router = router || {};
    this.view = null;
  }

  /**
   * Destroy
   *
   * @returns {Route}
   * @private
   */
  Route.prototype.destroy = function() {
    console.log("Route.prototype.destroy - this ", this);
    if (this.view) {
      this.view.teardown();
      this.view = null;
    }
    return this;
  };

  /**
   * Get state
   *
   * @returns {Object}
   * @private
   */
  Route.prototype.getState = function() {
    var data = {};

    for (var i = 0, c = this.allObserved.length; i < c; i++) {
      data[this.allObserved[i]] = this.view.get(this.allObserved[i]);
    }
    console.log("Route.prototype.getState - observe", this.observe);
    var resultPick = {
      qs: pick(data, this.observe.qs),
      hash: pick(data, this.observe.hash),
      state: pick(data, this.observe.state),
      middleware : this.observe.middleware || [],
      name : this.observe.name || '',
      pattern : this.observe.pattern || '',
      basePath : this.router.basePath
    };
    console.log('Route.prototype.getState - resultPick',resultPick);
    return resultPick;
  };

  /**
   * Init
   *
   * @param {Object} uri
   * @param {Object} data
   * @returns {Route}
   * @private
   */
  Route.prototype.init = function(uri, data) {
    var _this = this;
    assign(data, this.parsePath(uri.path), parseQS(uri.qs, this.observe.qs), parseHash(uri.hash, this.observe.hash));
    // not a component
    if (!_this.isComponent) {
      _this.router.recursiveMiddleware({
        uri: _this.router.uri,
        router: _this.router,
      },0,function(result) {
        function isPromise(value) {
          return value.toString().indexOf("Promise(") > -1;
        }
        if (isPromise(_this.Handler) == true) {
          _this.Handler().then(function(res) {
            _this.Handler = res;
            _this.router.recursiveMiddleware({
              uri: _this.router.uri,
              router: _this.router,
            },0,function(done){
              var handlerComponent = _this.Handler.extend({
                // template : `<h1>vadfvdafv</h1>`,
                // el: _this.router.el,
                target : '#router-view',
                data: data,
                uri: _this.router.uri,
                router: _this.router,
                oncomplete: function() {
                  let self = this;
                  this._super();
                  _this.router.recursiveMiddleware(self,0,function(result){
                    /* Code here */
                  },_this.router.afterEachMiddleware,{})
                },
              });
              if(Object.prototype.toString.call(Ractive.App) == "[object Function]"){
                Ractive.App = new Ractive.App({
                  oncomplete : function(){
                    handlerComponent();
                    this.setRouter(_this.router);
                    this.setUri(_this.router.uri);
                    this._super();
                  }
                });
              }else{
                handlerComponent();
                Ractive.App.setRouter(_this.router);
                Ractive.App.setUri(_this.router.uri);
              }
            },_this.getState().middleware,{})           
          });
        } else {
          console.log('Route.prototype.init - instance cache');
          _this.router.recursiveMiddleware({
            uri: _this.router.uri,
            router: _this.router,
          },0,function(done){
            var handlerComponent = _this.Handler.extend({
              target : '#router-view',
              data: data,
              uri: _this.router.uri,
              router: _this.router,
              oncomplete: function() {
                let self = this;
                this._super();
                _this.router.recursiveMiddleware(self,0,function(result){
                  /* Code here */
                },_this.router.afterEachMiddleware,{})
              },
            });
            handlerComponent()
            Ractive.App.setRouter(_this.router);
          Ractive.App.setUri(_this.router.uri)
          },_this.getState().middleware,{});
        }
      },this.router.beforeEachMiddleware,{});
    } else {
      alert('Ups get rarely event on this module');
      _this.view = new this.Handler({
        el: _this.router.el,
        data: data,
      });

      // observe
      if (_this.allObserved.length) {
        _this.view.observe(
          _this.allObserved.join(" "),
          function() {
            if (!_this.updating) {
              _this.router.update();
            }
          },
          { init: false }
        );
      }

      // notify Ractive we're done here
      _this.view.set("__ready", true);
    }

    return this;
  };

  /**
   * Match
   *
   * @param {String} request
   * @param {Boolean} strict
   * @returns {Boolean}
   * @private
   */
  Route.prototype.match = function(request, strict) {
    return strict ? this.strictRegExp.test(request) : this.regExp.test(request);
  };

  /**
   * Parse path
   *
   * @param {String} path
   * @returns {Object}
   * @private
   */
  Route.prototype.parsePath = function(path) {
    var parsed = path.match(this.regExp);
    var data = {};

    for (var i = 0, c = this.map.length; i < c; i++) {
      if (!isEmpty(parsed[i + 1])) {
        data[this.map[i]] = parseJSON(parsed[i + 1]);
      }
    }

    return data;
  };

  /**
   * Parse pattern
   *
   * @param {String} pattern
   * @returns {Array}
   * @private
   */
  function parsePattern(pattern) {
    return (pattern.match(/\/:\w+/g) || []).map(function(name) {
      return name.substr(2);
    });
  }

  /**
   * Pattern to RegExp
   *
   * @param pattern
   * @returns {RegExp}
   * @private
   */
  function patternToRegExp(pattern) {
    return new RegExp(
      patternToRegExpString(pattern)
        .replace(/^\^(\\\/)?/, "^\\/?")
        .replace(/(\\\/)?\$$/, "\\/?$"),
      "i"
    );
  }

  /**
   * Pattern to RegExp string
   *
   * @param {String} pattern
   * @returns {String}
   * @private
   */
  function patternToRegExpString(pattern) {
    return ("^" + pattern + "$")
      .replace(/\/:\w+(\([^)]+\))?/g, "(?:/([^/]+)$1)")
      .replace(/\(\?:\/\(\[\^\/]\+\)\(/g, "(?:/(")
      .replace(/\//g, "\\/");
  }

  /**
   * Pattern to strict RegExp
   *
   * @param {String} pattern
   * @returns {RegExp}
   * @private
   */
  function patternToStrictRegExp(pattern) {
    return new RegExp(patternToRegExpString(pattern));
  }

  /**
   * Router
   *
   * @param {Object} options
   * @constructor
   * @public
   */
  function Router(options) {
    let self = this;
    if (options.init != null) {
      /* 
				Jangan Di idupin nanti rusak push historinya, 
				Okelah kalo pengen custom cuman ingat hati hati
			*/
      this.init = options.init;
    }
    this.globals = options.globals || [];
    this.basePath = options.basePath == "/" ? "" : options.basePath || "";
    this.el = options.el;
    this.template = options.template;
    this.components = options.components;
    this.data =
      options.data ||
      function() {
        return {};
      };
    this.oncomplete = options.oncomplete ||
      function(){}
    this.history = options.history || history;
    this.strictMode = !!options.strictMode;
    this.reloadOnClick = options.reloadOnClick;
    this.linksWatcher = null;
    this.stateWatcher = null;
    this.route = null;
    this.routes = [];
    this.routeName = {};
    this.routeUrl = {};
    this.middlewarePerRoute = {};
    this.uri = {};

    Ractive.App = Ractive.default.extend({
      components : {
        ...this.components,
      },
      computed : options.computed,
      template : this.template,
      el: this.el,
      data: this.data,
      oncomplete: this.oncomplete,
      setUri : function(uri){
        this.uri = uri;
      },
      setRouter : function(router){
        this.router = router;
      },
    })
  }

  /* Static Type check allowed type data */
  Router.prototype.staticType = function(inVariable, typeDatas = []) {
    var isWRong = true;
    var closureCondition = function(theVariable, arrayRecordTypeOf) {
      return function(typeDataItem) {
        switch (true) {
          case typeDataItem == Promise:
            if (theVariable instanceof Promise) {
              return true;
            }
            return false;
          case typeDataItem == Array:
            return Array.isArray(theVariable);
          case typeDataItem == undefined:
          case typeDataItem == null:
            if (theVariable == typeDataItem) {
              return true;
            }
            arrayRecordTypeOf.push(typeDataItem);
            return false;
          case typeof theVariable == typeDataItem.name.toLowerCase():
            return true;
          default:
            arrayRecordTypeOf.push(typeDataItem.name);
            return false;
        }
      };
    };
    var recordTypeOf = [];
    var doCheckStaticType = closureCondition(inVariable, recordTypeOf);
    for (var a = 0; a < typeDatas.length; a++) {
      if (doCheckStaticType(typeDatas[a]) == true) {
        isWRong = false;
        break;
      }
    }
    if (isWRong == true) {
      var messageError = `value "${inVariable}" is Wrong type of variable, the requirement is ${JSON.stringify(recordTypeOf)}`;
      throw new Error(messageError);
    }
  };

  /**
   * Add setOnInit
   *
   * @param {Function} onInit
   * @public
   */
  Router.prototype.setOnInits = function(onInits) {
    this.staticType(onInits, [Array]);
    this.onInits = onInits || [];
  };

  /**
   * Add setOnInit
   *
   * @param {Function} onComplete
   * @public
   */
  Router.prototype.setOnComplete = function(onComplete) {
    this.onCompleteInit =
      onComplete ||
      function(fixVar,props,done,next) {
        next(null);
      };
  };

  Router.prototype.setOnBeforeEach = function(middleware) {
    this.beforeEachMiddleware = middleware || [];
  };

  Router.prototype.setOnAfterEach = function(middleware) {
    this.afterEachMiddleware = middleware || [];
  };

  Router.prototype.recursiveMiddleware = function(fixVariable,index,done,middlewares,props=null){
    if(index == middlewares.length){ 
      return done();
    }
    var next = index + 1;
    return middlewares[index](fixVariable,props,done,this.recursiveMiddleware.bind(this,fixVariable,next,done,middlewares))
  }

  /**
   * Add route Exception
   *
   * @param {Function} onAddRouteException
   * @returns {Function}
   * @public
   */
  Router.prototype.addRouteException = function(onAddRouteException) {
    this.onAddRouteException = onAddRouteException;
  };

  /**
   * Add route
   *
   * @param {String} pattern
   * @param {Function} Handler
   * @param {Object} [observe]
   * @returns {Router}
   * @public
   */
  Router.prototype.addRoute = function(pattern, Handler, observe) {
    this.routes.push(new Route(pattern, Handler, observe, this));
    if (observe != null && observe.name != null) {
      this.routeName[observe.name] = this.basePath + pattern;
      this.routeUrl[this.basePath + pattern] = observe.name;
    }
    return this;
  };

  /**
   * Add start
   *
   * @public
   */
  Router.prototype.start = function() {
    let self = this;
    self.routeName = (function(router_store_list) {
      self.staticType(router_store_list, [Object]);
      return function(whatROuteName) {
        self.staticType(whatROuteName, [String]);
        if (router_store_list[whatROuteName] == null) {
          return "";
        }
        return router_store_list[whatROuteName];
      };
    })(self.routeName);
    self.routeUrl = (function(router_store_list) {
      self.staticType(router_store_list, [Object]);
      return function(whatROuteName) {
        self.staticType(whatROuteName, [String]);
        if (router_store_list[whatROuteName] == null) {
          return "";
        }
        return router_store_list[whatROuteName];
      };
    })(self.routeUrl);
    this.recursiveMiddleware({
      name : self.routeUrl(global.location.pathname),
      uri : this.getUri(),
      location : global.location
    },0,function(result){
      /* Add next scenario code at here  */
      self.onCompleteInit(result);
    },this.onInits,{});
  };

  /**
   * Build hash
   *
   * @param {String} mixIn
   * @returns {String}
   * @private
   */
  Router.prototype.buildHash = function(mixIn) {
    var data = this.route.getState().hash;

    return !isEmpty(data) || !mixIn ? stringifyHash(data) : mixIn;
  };

  /**
   * Build QS
   *
   * @param {Array} mixIn
   * @returns {String}
   * @private
   */
  Router.prototype.buildQS = function(mixIn) {
    return stringifyQS(assign.apply(null, [{}].concat(mixIn, this.route.getState().qs)));
  };

  /**
   * Dispatch
   *
   * @param {String} request
   * @param {Object} [options]
   * @returns {Router}
   * @public
   */
  Router.prototype.dispatch = function(request, options) {
    console.log("Router.prototype.dispatch - req ", request,options);
    this.staticType(options, [Object]);
    this.staticType(options.qs, [Object, String, null]);
    this.staticType(options.hash, [String, null]);
    this.staticType(options.noHistory, [Boolean]);
    options = options || {};
    let parsePathName = this.routeName(request);
    var uri = parseUri(parsePathName==""?request:parsePathName);
    uri.path = uri.path.replace(this.basePath, "");
    var route = this.match(uri.path);
    console.log("Router.prototype.dispatch - route ", route);
    var oldUri = this.uri;
    
    // 404
    if (!route) {
      /* Harus redirect ke addRouteException */
      return this.redirect(request);
    }

    if (options.reload || shouldDispatch(this.uri, uri, route)) {
      // prepare data
      if (this.route && this.route.view) {
        options.state = options.state || {};

        this.globals.forEach(function(global) {
          if (options.state[global] === undefined) {
            options.state[global] = this.route.view.get(global);
          }
        }, this);
      }

      var defaults = typeof this.data === "function" ? this.data() : this.data;
      var data = assign(defaults, options.state, options.hash, options.qs);
      route.urlData = defaults;
      // destroy existing route
      if (this.route) {
        this.route.destroy();
      }

      // init new route
      this.uri = uri;
      this.route = route.init(uri, data);
    }

    // will scroll to the top if there is no matching element
    if (!options.noScroll) {
      scrollTo(uri.hash.substr(1));
    }

    // update history
    if (typeof options.qs == "string") {
      uri.qs = options.qs;
    } else {
      if (options.qs != null) {
        uri.qs = this.buildQS(options.qs || {});
      }
    }
    /* MASIH BINGUN SAMA INI *
    /* DIPELAJARI DULU */
    var updateState = true;
    if (oldUri.path == uri.path) {
      if(oldUri.qs != uri.qs){
        updateState = true;
      }
    }
    if(oldUri.path == null){
      updateState = false;
    }
    console.log('oldUrl',oldUri);
    console.log('uri',uri);
    // return this.update(!oldUri.path || oldUri.path !== uri.path, !options.noHistory, uri);
    return this.update(!updateState, !options.noHistory, uri);
  };

  /**
   * Get URI
   *
   * @returns {String}
   * @public
   */
  Router.prototype.getUri = function() {
    return location.pathname.substr(this.basePath.length) + location.search + location.hash;
  };

  /**
   * Init
   *
   * @param {Object} [options]
   * @returns {Router}
   * @public
   */
  Router.prototype.init = function(options) {
    return this.dispatch(this.getUri(), assign({ noHistory: true }, options));
  };

  /**
   * Get the first `route` matching the `request`
   *
   * @param {String} request
   * @returns {Object|null}
   * @public
   */
  Router.prototype.match = function(request) {
    var i = -1;

    while (this.routes[++i]) {
      if (this.routes[i].match(request)) {
        return this.routes[i];
      }
    }

    return null;
  };

  /**
   * Get the first `route` matching the `request`
   *
   * @param {String} urlString
   * @returns {Boolean}
   * @public
   */
  Router.prototype.validURL = function(urlString) {
    this.staticType(urlString, [String]);
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(urlString);
  };

  /**
   * Redirect
   *
   * @param {String} request
   * @returns {Router}
   * @private
   */
  Router.prototype.redirect = function(request) {
    // location.pathname = joinPaths(this.basePath, request);
    if (this.validURL(request) == true) {
      return (global.location.href = request);
    }
    this.onAddRouteException(404);
    return this;
  };

  /**
   * Unwatch links
   *
   * @returns {Router}
   * @public
   */
  Router.prototype.unwatchLinks = function() {
    if (this.linksWatcher) {
      document.body.removeEventListener("click", this.linksWatcher);
      this.linksWatcher = null;
    }

    return this;
  };

  /**
   * Unwatch state
   *
   * @returns {Router}
   * @public
   */
  Router.prototype.unwatchState = function() {
    if (this.stateWatcher) {
      global.removeEventListener("popstate", this.stateWatcher);
      this.stateWatcher = null;
    }

    return this;
  };

  /**
   * Update
   *
   * @param {Boolean} [pathChange]
   * @param {Boolean} [history] - true = always, false = never, undefined = if something changed
   * @param {Object} [uri]
   * @returns {Router}
   * @private
   */
  Router.prototype.update = function(pathChange, history, uri) {
    if (!this.route) {
      return this;
    }

    uri = uri || { qs: "", hash: "" };
    var path = joinPaths(this.basePath, this.uri.path);
    
    var qs = this.buildQS([parseQS(uri.qs)].concat(pathChange == true ? [parseQS(location.search)] : []));
    // var qs = this.buildQS([ parseQS(uri.qs) ].concat(parseQS(location.search)));
    var hash = this.buildHash(uri.hash);
    var newUri = path + qs + hash;
    var oldUri = location.pathname + location.search + location.hash;
    var state = this.route.getState().state;
    this.uri.qs = qs;
    this.uri.hash = hash;
    console.log("Router.prototype.update - history ", history);
    console.log("Router.prototype.update - state ", state);
    console.log("Router.prototype.update - newUri ", newUri);
    if (history === true) {
      console.log("Router.prototype.update - this.history ", this.history);
      console.log("Router.prototype.update - global.history ", global.history);
      this.history.pushState(state, null, newUri);
    } else if (history === false) {
      this.history.replaceState(state, null, newUri);
    } else if (newUri !== oldUri) {
      this.history.pushState(state, null, newUri);
    }

    return this;
  };

  /**
   * Watch links
   *
   * @param {RegExp} [pattern]
   * @returns {Router}
   * @public
   */
  Router.prototype.watchLinks = function(pattern) {
    pattern = pattern || new RegExp("^((https?:)?\\/\\/" + location.hostname.replace(/\./g, "\\.") + ".*|((?!\\/\\/)[^:]+))$");
    var _this = this;

    document.body.addEventListener(
      "click",
      (this.unwatchLinks().linksWatcher = function(e) {
        var el = parents(e.target, "a");
        if (el) {
          var href = el.getAttribute("href") || el.getAttribute("data-href");
          /* 
            Sementara di comment dulu jika tidak
            Href yang tidak ada link atau hanya # malah location reload
          */
          if (href && !el.classList.contains("router-ignore") && pattern.test(href)) {
            if (_this.reloadOnClick) {
              
              _this.dispatch(href, { reload: true });
            } else {
              _this.dispatch(href, { noHistory: false });
            }

            e.preventDefault();
          }
        }
      })
    );

    return this;
  };

  /**
   * Watch state
   *
   * @returns {Router}
   * @public
   */
  Router.prototype.watchState = function() {
    var _this = this;

    global.addEventListener(
      "popstate",
      (this.unwatchState().stateWatcher = function(e) {
        if (e.state != null) {
          _this.init({ state: e.state });
        }
      })
    );

    return this;
  };

  /**
   * Watch url change
   *
   * @returns {Router}
   * @public
   */
  Router.prototype.watchURLChange = function(callback) {
    let self = this;
    var realPushState = history.pushState;
    if(this._events == null){
      this._events = [];
    }
    let isNew= true;
    for(var a=0;a<this._events.length;a++){
      if(this._events[a].toString() == callback.toString()){
        isNew = false;
        break;
      }
    }
    if(isNew == true){
      this._events.push(callback);
      global.masterData.setOnListener('ractive_router.url_change',callback);
    }
    history.pushState = function(some, args, I, dunno) {
    // do the thing you want to do
      global.masterData.saveData('ractive_router.url_change',self.route.getState(),1000);
      return realPushState.apply(history, arguments); // leave this line exactly as-is.
    };
    global.onpopstate = function(event) {
      global.masterData.saveData('ractive_router.url_change',self.route.getState(),1000);
    };
  }

  /**
   * Should dispatch
   *
   * @param {Object} oldUri
   * @param {Object} newUri
   * @param {Object} route
   * @returns {Boolean}
   * @private
   */
  function shouldDispatch(oldUri, newUri, route) {
    return oldUri.path !== newUri.path || oldUri.qs !== newUri.qs || (decodeURIComponent(oldUri.hash) !== decodeURIComponent(newUri.hash) && (!route || route.observe.hash.length));
  }

  /**
   * Assign
   *
   * @param {Object} object
   * @param {...Object} source
   * @returns {Object}
   * @private
   */
  function assign(object, source) {
    for (var i = 1, c = arguments.length; i < c; i++) {
      for (var x in arguments[i]) {
        if (arguments[i].hasOwnProperty(x) && arguments[i][x] !== undefined) {
          object[x] = arguments[i][x];
        }
      }
    }

    return object;
  }
  /**
	 * Compact
	 *
	 * @param {Object} collection
	
	 * @returns {Object}
	 * @private
	 */
  function compact(collection) {
    return pick(collection, function(value) {
      return !isEmpty(value);
    });
  }

  /**
   * Decode + characters to spaces in application/x-www-form-urlencoded string
   *
   * @param {string} string
   * @returns {string}
   * @private
   */
  function decodeForm(string) {
    return string.replace(/\+/g, " ");
  }

  /**
   * Is empty
   *
   * @param {*} value
   * @returns {Boolean}
   * @private
   */
  function isEmpty(value) {
    if (!value || typeof value !== "object") {
      return !value;
    }

    return !Object.keys(value).length;
  }

  /**
   * Join paths
   *
   * @param {...String} parts
   * @returns {String}
   * @private
   */
  function joinPaths(parts) {
    return Array.prototype.slice
      .call(arguments)
      .join("/")
      .replace(/\/+/g, "/");
  }

  /**
   * Parents
   *
   * @param {Element} el
   * @param {String} name
   * @returns {Element|null}
   * @private
   */
  function parents(el, name) {
    while (el && el.nodeName.toLowerCase() !== name) {
      el = el.parentNode;
    }

    return el && el.nodeName.toLowerCase() === name ? el : null;
  }

  /**
   * Parse hash
   *
   * @param {String} hash
   * @param {Array} [keys]
   * @returns {Object}
   * @private
   */
  function parseHash(hash, keys) {
    try {
      var parsed = compact(JSON.parse(decodeURIComponent(hash.substr(2))));

      return keys ? pick(parsed, keys) : parsed;
    } catch (e) {
      return {};
    }
  }

  /**
   * Parse JSON
   *
   * @param {String} string
   * @returns {*}
   * @private
   */
  function parseJSON(string) {
    try {
      return JSON.parse(string);
    } catch (e) {
      return string || "";
    }
  }

  /**
   * Parse URI
   *
   * @param {String} uri
   * @returns {{protocol: string, host: string, path: string, qs: string, hash: string}}
   * @private
   */
  function parseUri(uri) {
    var parts = uri.match(/^(?:([\w+.-]+):\/\/([^/]+))?([^?#]*)?(\?[^#]*)?(#.*)?/);

    return {
      protocol: parts[1] || "",
      host: parts[2] || "",
      path: parts[3] || "",
      qs: parts[4] || "",
      hash: parts[5] || "",
    };
  }

  /**
   * Parse QS
   *
   * @param {String} qs
   * @param {Array} [keys]
   * @returns {Object}
   * @private
   */
  function parseQS(qs, keys) {
    if (qs == null) {
      return;
    }
    var index = qs.indexOf("?");
    var parsed = {};

    if (index !== -1) {
      var pairs = qs.substr(index + 1).split("&");
      var pair = [];

      for (var i = 0, c = pairs.length; i < c; i++) {
        pair = pairs[i].split("=");

        if (!isEmpty(pair[1]) && !isEmpty(parseJSON(pair[1]))) {
          parsed[decodeForm(decodeURIComponent(pair[0]))] = parseJSON(decodeForm(decodeURIComponent(pair[1])));
        }
      }
    }

    return keys ? pick(parsed, keys) : parsed;
  }

  /**
   * Pick
   *
   * @param {Object} object
   * @param {Array|Function} keys
   * @returns {Object}
   * @private
   */
  function pick(object, keys) {
    var data = {};

    if (typeof keys === "function") {
      for (var x in object) {
        if (object.hasOwnProperty(x) && keys(object[x], x)) {
          data[x] = object[x];
        }
      }
    } else {
      for (var i = 0, c = keys.length; i < c; i++) {
        data[keys[i]] = object[keys[i]];
      }
    }

    return data;
  }

  /**
   * Scroll to
   *
   * @param {String} id
   * @private
   */
  function scrollTo(id) {
    var el = document.getElementById(id);

    if (el) {
      global.scrollBy(0, el.getBoundingClientRect().top);
    } else {
      global.scrollTo(0, 0);
    }
  }

  /**
   * Stringify
   *
   * @param {*} value
   * @returns {String}
   * @private
   */
  function stringify(value) {
    if (!value || typeof value !== "object") {
      return value;
    }

    return JSON.stringify(value);
  }

  /**
   * Stringify hash
   *
   * @param {Object} data
   * @returns {String}
   * @private
   */
  function stringifyHash(data) {
    data = compact(data);

    return !isEmpty(data) ? "#!" + encodeURIComponent(stringify(data)) : "";
  }

  /**
   * Stringify QS
   * @param {Object} data
   * @returns {String}
   */
  function stringifyQS(data) {
    var qs = "";

    for (var x in data) {
      if (data.hasOwnProperty(x) && !isEmpty(data[x])) {
        qs += "&" + encodeURIComponent(x) + "=" + encodeURIComponent(stringify(data[x]));
      }
    }

    return qs ? "?" + qs.substr(1) : "";
  }

  Router.Route = Route;
  return (Ractive.Router = Router);
});

import Ractive from "./lib/BaseRactive";
import Router from "./lib/RactiveRouter";
import LoadingPage from './components/LoadingPage';
import SideMenu from './components/SideMenu';
import { BasicWindowInterface } from "./@types";
import DashboardRoute from './dashboard/Route';

declare var window: BasicWindowInterface;

/* Ini Wajib ada untuk trigger load globalnya, kalo ini tidak di set Tidak jalan */
// gettext("Salutations");

const router : any = new Router({
  components : {
    "main-side-menu" : SideMenu
  },
  el: "#main",
  basePath: "/",
  data : function(){
    return {
      _template : <any>null
    }
  },
  oncomplete : function(){
    let self = this;
    /* Listen url are changed */
    window.router.watchURLChange(function(state : {
      name : string
    }){
      switch(state.name){
        case 'auth.login':
        case 'auth.register':
        case 'auth.logout':
        case 'auth.not_login_yet':
          self.set('_template','auth')
        break;
        default :
          self.set('_template','main');
        break;
      }
    })
    var state = this.router.route.getState();
    switch(state.name){
      case 'auth.login':
      case 'auth.register':
      case 'auth.logout':
      case 'auth.not_login_yet':
        self.set('_template','auth')
      break;
      case 'error.404':
        self.set('_template','error')
      break;
      default :
        self.set('_template','main');
      break;
    }
  },
  template : `
    {{#if _template == "error" }}
    {{/if}}
    {{#if _template == "auth" }}
    {{/if}}
    {{#if _template == "main" }}
    <div class="ui visible sidebar inverted vertical menu" id="wr-sidebar">
      <main-side-menu></main-side-menu>
    </div>
    {{/if}}
    <div id="router-view"></div>
  `
});

window.router = router;
DashboardRoute(router);
router.addRoute(
  "/404",
  function() {
    return new Promise(function(resolve) {
      import("./components/PageNotFound").then(page => {
        resolve(page.default);
      })
    });
  },
  {
    name : 'error.404',
    middleware: []
  }
);

router.addRouteException(function(errorNumber : number) {
  switch (errorNumber) {
    case 404:
      window.router.dispatch(router.routeName('error.404'), {
        noHistory: false
      });
      break;
    case 301:
      break;
  }
});


/* Untuk Pertama Kali Loaded */
router.setOnInits([]);

/* Untuk Pertama Kali Loaded */
router.setOnComplete(function(props : any,value : any) {
  router
    .dispatch(window.location.pathname, {
      noHistory: true,
    })
    /* Ini untuk selalu listen a href */
    // .watchLinks()
    /* Ini penting untuk menjaga historynya  */
    .watchState();
});

router.setOnBeforeEach([function(props : any,value : any,done : Function,next : Function){
  /* Inject #main lalu pasang page Loading, untuk waiting download asset */
  new LoadingPage();
  /* 
    Pending sebentar karena untuk kalibrasi window.location
    Kalau tidak nanti window.location yang lama bakal kepake dan kacau
   */
  setTimeout(() => {
    next();
  }, 1000);
}]);

router.setOnAfterEach([
  function(ractiveComponent : any,value : any,done : Function,next : Function) {
    next();
  }
]);

if (module.hot) {
  module.hot.accept();
}

export default function(asyncDone : any){
  router.start();
  asyncDone(null);
}
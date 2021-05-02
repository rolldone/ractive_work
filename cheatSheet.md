## How to Add component programatic and specific component tag as a target 
```js
oncomplete : function(){
    /* Because this component is running it self, and some method is need waiting from master app, so need install component child on complete */
    var sideMenu = SideMenu();
    this.attachChild(sideMenu, { target: 'side-menu'})
  }
/* And on render */
template : `<div><# side-menu/></div>`
```
const RactiveRouter = require('./js/RactiveRouter');

/* Need refactor RactiveRouter on js */
export interface RactiveRouterInterface {
  addRoute ?: any
  addRouteException ?: any
  setOnInits ?: any
  setOnComplete ?: any
  dispatch ?: any
  setOnBeforeEach ?: any
  setOnAfterEach ?: any
  start ?: any
} 

export default RactiveRouter;
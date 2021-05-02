import Bootstrap from './bootstrap';
import Route from './Route';
import BaseStart from './lib/BaseStart';
BaseStart({
  init: [
    /* Your code Bootstrap here */
    Bootstrap,
    Route
  ],
  run: async function () {
    /* You can create some programatic code here */
    console.log('App success load!');
  }
});

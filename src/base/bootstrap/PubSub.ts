import PubSub from './js/PubSub.js';

export default function(asyncDone : Function){
  console.log('pubsub',global.pubsub);
  if(global.pubsub == null){
    global.pubsub = PubSub;
  }
  asyncDone(null);
}
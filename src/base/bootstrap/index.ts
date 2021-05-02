import MasterData from './MasterData';
import PubSub from './PubSub';
import { MyWindow, SeriesInterface } from '../@types';

declare var asyncSeries : SeriesInterface;
declare var window : MyWindow;

const task = [
  PubSub,
  MasterData
  /* Other bootstrap ? */
];

export default function(asyncDone : Function){
  asyncSeries(task,function(err : any,result : any){
    if(err){
      return console.error(err);
    }
    console.log('Initialize Bootstrap Is Done!');
    asyncDone(null);
  })
}


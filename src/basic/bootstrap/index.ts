import { SeriesInterface } from '@/base/@types';
import BaseBootstrap from '@/base/bootstrap';

declare var asyncSeries : SeriesInterface;
const task = [
  BaseBootstrap,
  /* Other bootstrap ? */
];

export default function(asyncDone : Function){
  asyncSeries(task,function(err : any,result : any){
    if(err){
      return console.error(err);
    }
    console.log('Initialize BasicBootstrap Is Done!');
    asyncDone(null);
  });
}



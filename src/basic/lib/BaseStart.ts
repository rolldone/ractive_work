import { SeriesInterface } from "@/base/@types";

export interface BaseStartInterface {
  init : Array<any>
  run : Function
}

declare var asyncSeries : SeriesInterface;

async function BaseStart(props : BaseStartInterface){
  try{
    const task : Array<any> = props.init;
    await (function(task : Array<any>){
      return new Promise(function(resolve : Function, rejected : Function){
        asyncSeries(task,function(err : any,result : any){
          if(err){
            console.log('index asyncjs error ',err);  
            rejected(err);
          }
          console.log(result);
          resolve();
        });
      });
    })(task);
    props.run();
  }catch(ex){
    console.error('BaseStart ex',ex);
  }
}

export default BaseStart;
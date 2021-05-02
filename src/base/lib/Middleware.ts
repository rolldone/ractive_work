/**
 * Its like for vue
 * @param index 
 * @param the_to 
 * @param the_from 
 * @param next 
 * @param middlewares 
 * @returns Promise
 */
const defineRecursiveMiddleware = function(index : number,the_to : any,the_from : any,next : Function ,middlewares : Array<any>){
	return new Promise(async function(resolve){
		if(middlewares[index] == null){
			return resolve(null);
		}
		let nextMiddlewareItem : any = await defineRecursiveMiddleware(index+1,the_to,the_from,next,middlewares);
		if(nextMiddlewareItem == null){
			nextMiddlewareItem = next;
			if(next == null){
				nextMiddlewareItem = ()=>{};
			}
			
		}
		return resolve(middlewares[index].bind(null,the_to,the_from,next,nextMiddlewareItem));
	})
}

export default defineRecursiveMiddleware;
import { MyWindow, router } from '@/base/@types';

export interface BasicRouterInterface extends router{
  watchURLChange: {(props: Function):void}
}

export interface BasicWindowInterface extends MyWindow{
  router : myRouter
}
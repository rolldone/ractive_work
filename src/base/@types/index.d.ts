import { series } from 'async';

export type SeriesInterface = typeof series;

/* Router */
export interface router{
  routeName: { (whatRouteName: string): void }
  dispatch: { (stringUrlOrName: string, props: object): void }
}

/* Window */
export interface MyWindow extends Window {
  template_data: any;
  staticType: any
  grecaptcha: any
  router: router
  componentsHash: object
  location : Location
  masterData : object
  asyncSeries : any
}


import {series} from 'async';
/* Get from webpack providePlugin */
declare var asyncSeries : typeof series;
export default asyncSeries;
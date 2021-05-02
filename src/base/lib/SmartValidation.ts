const BaseSmartValidation = require('./js/SmartValidation');

export interface SmartValidationInterface {
  privSubmitValidation : {(props : any, callback : Function) : void}
  privInputTextValidation :  {(wrapperTarget : String, props : any , callback : Function) : void}
  inputTextValidation : {(props : any) : void}
  inputPasswordValidation : {(props : any) : void }
  submitValidation : {( props : any ) : void}
}

function SmartValidationFunction(smartValidation : SmartValidationInterface){
  return smartValidation;
}

export default function SmartValidation(id:String|HTMLElement|void){
  let smart : any = new BaseSmartValidation(id);
  return SmartValidationFunction({
    privSubmitValidation : smart.privSubmitValidation,
    privInputTextValidation : smart.privInputTextValidation,
    inputTextValidation : smart.inputTextValidation,
    inputPasswordValidation : smart.inputPasswordValidation,
    submitValidation : smart.submitValidation,
  });
};
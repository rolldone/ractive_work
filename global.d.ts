
declare module NodeJS {
  interface Global {
    Arg : any
    CustomError : {(name : string, message : string): void}
    staticType : {(inVariable : any, typeDatas : Array<any>) : void}
    app : any,
    Server : any,
    queues : any,
    pubsub : any,
    nrp : any,
    minio : any,
    nohm : any,
    redis : any,
    serializeError : any,
    deserializeError : any
  }
  interface Process {
    /* Jika kerja di backend define ini manual */
    browser: boolean
  }
  
}

declare module TestNameSpace {
  interface TestInterface{
    /* Inside interface cannot call child directly */
    TestType : string
  }
  /* You can call type */
  type TestType : string
}

declare module '*.html' {
  var html: string;
  export default  html;
}
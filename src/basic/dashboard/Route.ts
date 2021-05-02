export default function(router : any){
  router.addRoute(
    "/",
    function() {
      return new Promise(function(resolve : Function) {
        require.ensure([], function() {
          import("./Index").then(page => {
            resolve(page.default);
          })
        });
      });
    },
    {
      name : 'dashboard.index',
      middleware: []
    }
  );
}
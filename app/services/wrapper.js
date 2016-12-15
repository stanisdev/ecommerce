'use strict';

module.exports = function(asyncFunc) {
   return function(req, res, next) {
      asyncFunc(req, res, next)
      .catch((err) => {
         console.log("Error in route: ", err);
      });
   };
};

'use strict';

module.exports = (app, co, mongoose) => {

   // Menu navigation
   app.use(co(function* (req, res, next) {

      mongoose.Category.menuNavigation(data => {
         app.locals.categories = data;
         next();
      });
   }));
};

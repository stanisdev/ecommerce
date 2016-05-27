'use strict';

module.exports = (app, co, mongoose) => {

   // Menu navigation
   app.use(co(function* (req, res, next) {
      app.locals.categoriesWithSubcats = yield mongoose.Category.getAllCategoriesAndSubcats();;
      next();
   }));
};

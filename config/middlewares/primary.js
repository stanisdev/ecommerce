'use strict';

module.exports = (app, mongoose, wrap) => {

   /**
   * Menu navigation
   */
   app.use(wrap(async function(req, res, next) {
      app.locals.categoriesWithSubcats = await mongoose.model('Category').getAllCategoriesAndSubcats();
      next();
   }));
};

'use strict';

module.exports = (app, co, mongoose) => {

   // Menu navigation
   app.use(co(function* (req, res, next) {
      const Category = yield mongoose.Category;
      const categories =
         yield Category
                  .find({enabled: true})
                  .select('title url subcategory.title subcategory.url subcategory.enabled')
                  .exec();

      app.locals.categories = categories;
      next();
   }));
};

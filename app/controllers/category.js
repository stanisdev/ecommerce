'use strict';

module.exports = (app, co, mongoose) => {

   var router = (require('express')).Router();

   // Regexp urls
   var urls = {
      category: /^\/(page\/(\d+))?$/,
      subcategory: /^\/subcat\/([a-zA-Z\d_]+)(\/page\/(\d+))?$/,
      goods: /^\/subcat\/([a-zA-Z\d_]+)\/item\/([abcdef\d]{24})$/
   };

   // Get category name
   app.param('categoryName', (req, res, next, categoryName) => {
      if (categoryName) {
         res['categoryName'] = categoryName;
      }
      next();
   });

   // Use router
   app.use('/category/:categoryName', router);


   /**
    * Category page rendering everething goods with pagination
    */
   router.get(urls.category, co(function* (req, res) {
      const category = res.categoryName;

      // Then there is pagination action
      if (req.params[1]) {
         const page = req.params[1];
      }
      const list = yield mongoose.Category.list(category);
      res.render('category/face');
   }));


   /**
    * Subcategory
    */
   router.get(urls.subcategory, co(function* (req, res) {
      const subcat = req.params[0];

      // There is pagination
      if (req.params[2]) {
         const page = req.params[2];
      }
      res.send('Subcat');
   }));


   /**
    * Goods overview
    */
   router.get(urls.goods, co(function* (req, res) {
      const subcat = req.params[0];
      const item = req.params[1];

      res.send('goods');
   }));
};


/**
Type of URL
/category/mens
/category/mens/page:2
/category/mens/subcat/shirts
/category/mens/subcat/shirts/page/2
/category/mens/subcat/shirts/item/57345e7fadda261b1a8ef93a
**/

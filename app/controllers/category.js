'use strict';

module.exports = (app, co, mongoose) => {

   /**
    * Initial preparations
    */
   const router = (require('express')).Router();
   const urls = {
      category: /^\/(page\/(\d+))?$/,
      subcategory: /^\/subcat\/([a-zA-Z\d_]+)(\/page\/(\d+))?$/
   };
   app.param('categoryName', (req, res, next, categoryName) => {
      if (categoryName) res['categoryName'] = categoryName;
      next();
   });
   app.use('/category/:categoryName', router);


   /**
    * Category page rendering everething goods with pagination
    */
   router.get(urls.category, co(function* (req, res) {
      const _ = require('lodash');
      const name = res.categoryName;

      if (req.params[1]) { // If there is pagination action
         const page = req.params[1]
      }

      // Get category info
      const category = yield mongoose.Category.findCategoryByUrl(name);
      if (!category || !_.isObject(category) || Object.keys(category).length < 1) {
         return res.render('main/404');
      }

      // Get goods list
      const goods = yield mongoose.Goods.findGoodsByCategoryId(category._id);
      res.render('category/allGoods', {
         goods: goods,
         category: category
      });
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
};


/**
Type of URL
/category/mens
/category/mens/page:2
/category/mens/subcat/shirts
/category/mens/subcat/shirts/page/2
**/

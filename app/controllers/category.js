'use strict';

module.exports = (app, co, mongoose) => {

   const router = (require('express')).Router();

   // Regexp urls
   const urls = {
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
      const _ = require('lodash');
      const name = res.categoryName;

      // Then there is pagination action
      if (req.params[1]) {
         const page = req.params[1]
      }

      const category = yield mongoose.Category.findCategoryByUrl(name);
      if (!category || !_.isObject(category) || Object.keys(category).length < 1) {
         return res.render('main/404');
      }

      const goods = yield mongoose.Goods.findGoodsByCategoryId(category._id);
      console.log(goods);

      res.render('category/allGoods');
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

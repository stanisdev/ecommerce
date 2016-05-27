'use strict';

module.exports = (app, co, mongoose) => {

   /**
    * Initial preparations
    */
   const router = (require('express')).Router();
   const urls = {
      category: /^\/(page\/(\d+))?(\/)?(options\/([a-z]+:\[(\d,?)+\],?)*)?$/,
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
      const categoryName = res.categoryName;
      const page = (req.params[1] ? (req.params[1] - 1) : 0);
      const options = require('./../helpers/category').disassemleUrlOptions(req.params[3] );

      const data = yield mongoose.Category.findGoodsByCategeoryName(page, options, categoryName, mongoose);

      // Check data on correct values
      if (!data || !_.isObject(data) || Object.keys(data).length < 1 || data.goods.length < 1) {
         return res.render('main/404');
      }
      res.render('category/allGoods', {data});
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
/category/mens/page/2
/category/mens/subcat/shirts
/category/mens/subcat/shirts/page/2
http://localhost:5001/category/mens/options/sort:[4],discounts:[1,3]
**/

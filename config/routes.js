'use strict';

/**
 * Include controllers and set up routes
 */
module.exports = (app, config) => {

   const category = require(config.root_dir + '/app/controllers/category');
   const router = (require('express')).Router();

   // Set router's handlers
   app.get('/', category.index);
   router.get(/^\/(page\/(\d+))?(\/)?(options\/([a-z]+:\[(\d,?)+\],?)*)?$/, category.allGoods);

   // Fill category-name parameter
   app.param('categoryName', (req, res, next, categoryName) => {
      if (categoryName) {
         res['categoryName'] = categoryName;
      }
      next();
   });
   app.use('/category/:categoryName', router);
};

'use strict';

/**
 * Dependencies
 */
const express = require('express');

/**
 * Include controllers and set up routes
 */
module.exports = (app, config) => {

   const api = require(config.root_dir + '/app/controllers/api/category');
   const category = require(config.root_dir + '/app/controllers/category');
   const _router = express.Router();
   const router = {};

   ['category', 'api'].forEach(item => router[ item ] = _router);

   // Set router's handlers
   app.get('/', category.index);
   app.get('/demo-data', category.demoData);
   router.category.get(/^\/(page\/(\d+))?(\/)?(options\/([a-z]+:\[(\d,?)+\],?)*)?$/, category.allGoods);
   router.api.post('/getGoods', api.getGoods);

   // Fill category-name parameter
   app.param('categoryName', (req, res, next, categoryName) => {
      if (categoryName) {
         res['categoryName'] = categoryName;
      }
      next();
   });
   app.use('/category/:categoryName', router.category);
   app.use('/api/category', router.api);
};

'use strict';

/**
 * Dependencies
 */
const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const wrap = require('co-express');

module.exports = (app) => {

   /**
    * Menu navigation
    */
   app.use(wrap(function* (req, res, next) {
      app.locals.categoriesWithSubcats = yield Category.getAllCategoriesAndSubcats();
      next();
   }));
};

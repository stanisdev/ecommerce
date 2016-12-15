'use strict';

module.exports = (config) => {

   /**
    * Dependencies.
    */
   const errorhandler = require('errorhandler');
   const bodyParser = require("body-parser");
   const express = require('express');
   const engine = require('ejs-mate');
   const app = express();

   app.use(bodyParser.urlencoded({extended: false}));
   app.use(bodyParser.json());

   // Ejs templater use
   app.engine('ejs', engine);
   app.set('views', config.app_dir + '/views');
   app.set('view engine', 'ejs');

   // Static files middleware
   app.use(express.static(config.root_dir + '/public'));

   // Error handler middleware
   if (config.env === 'development') app.use(errorhandler());

   // Fill category-name parameter
   app.param('categoryName', (req, res, next, categoryName) => {
      if (categoryName) {
         res['categoryName'] = categoryName;
      }
      next();
   });

   return {app, express};
};

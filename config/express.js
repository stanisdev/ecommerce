'use strict';

module.exports = (config) => {

   /**
    * Dependencies.
    */
   const errorhandler = require('errorhandler');
   const bodyParser = require("body-parser");
   const express = require('express');
   const engine = require('ejs-mate');
   const morgan = require('morgan');
   const app = express();

   const env = process.env.NODE_ENV || 'development';

   app.use(bodyParser.urlencoded({extended: false}));
   app.use(bodyParser.json());

   // Ejs templater use
   app.engine('ejs', engine);
   app.set('views', config.root_dir + '/app/views');
   app.set('view engine', 'ejs');

   // Static files middleware
   app.use(express.static(config.root_dir + '/public'));

   // Error handler middleware
   if (env === 'development') app.use(errorhandler());

   // Logging middleware
   if (env !== 'test') app.use(morgan('dev'));

   return app;
};

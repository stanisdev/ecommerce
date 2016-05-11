'use strict';

module.exports = (config) => {

   const express = require('express');
   const engine = require('ejs-mate');
   const app = express();

   // Ejs templater use
   app.engine('ejs', engine);
   app.set('views', config.root_dir + '/app/views');
   app.set('view engine', 'ejs');

   // Static files middleware
   app.use(express.static(config.root_dir + '/public'));

   return app;
};

'use strict';

const glob = require('glob');
const config = require(__dirname + '/config/config');
const {app, express} = require(config.dir + '/express')(config);
const port = config.express.port;
const mongooseConnection = require(config.dir + '/mongoose')(config);
const wrap = require(config.app_dir + '/services/wrapper');

mongooseConnection.then(mongoose => {
   if (process.env.IMPORT_DEMO_DATA) {
      return require(config.app_dir + '/services/demoData')(mongoose, wrap);
   }
   const middlewares = glob.sync(config.dir + '/middlewares/*.js');
   middlewares.forEach(middleware => {
      require(middleware)(app, mongoose, wrap);
   });

   const controllers = glob.sync(config.app_dir + '/controllers/**/*.js');
   controllers.forEach(controller => {
      require(controller)(app, express, mongoose, wrap, config);
   });

   app.listen(port, function() {
      console.log(`App listening on port ${port}!`);
   });
}).catch(error => {
   console.error(error);
});






// ---------------------------------------------------
//
// var express = require('express')
// var app = express()
//
// app.get('/', wrap(index));
//
// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!')
// });
//
// // =======================
//
// function wrap(asyncFunc) {
//   return function (req, res) {
//     asyncFunc(req, res).then(() => {}, () => {});
//   };
// }
//
// async function index(req, res) {
//   var data = await getData();
//   res.send(data + ' World!')
// }
//
// function getData() {
//     return new Promise(function(resolve, reject) {
//       setTimeout(function() {
//         resolve("Hello");
//       }, 1500);
//     });
// }

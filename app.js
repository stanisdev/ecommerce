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
   const passport = require(config.dir + '/passport')(app, mongoose, config);
   const middlewares = glob.sync(config.dir + '/middlewares/*.js');
   middlewares.forEach(middleware => {
      require(middleware)(app, mongoose, wrap);
   });

   const controllers = glob.sync(config.app_dir + '/controllers/**/*.js');
   controllers.forEach(controller => {
      require(controller)(app, express, mongoose, wrap, config, passport);
   });

   app.listen(port, function() {
      console.log(`App listening on port ${port}!`);
   });
}).catch(error => {
   console.error(error);
});

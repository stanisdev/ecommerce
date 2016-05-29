'use strict';

/**
 * Setting mongoose
 */
module.exports = (config, init) => {

   const mongoose = require('mongoose');
   mongoose.connect(`mongodb://${config.mongo.host}:${config.mongo.port}/${config.mongo.db}`);

   // Try to connect
   const db = mongoose.connection;
   db.on('error', console.error.bind(console, 'connection error:'));
   db.once('open', function() {

      const fs = require('fs');
      const join = require('path').join;
      const models = `${config.root_dir}/app/models/`;

      // Include models
      fs.readdirSync(models)
         .filter(file => ~file.search(/^[^\.].*\.js$/))
         .forEach(file => require(join(models, file))(mongoose));

      // Run primary part of application
      console.log('MongoDB has been connected!');
      init();
   });
};

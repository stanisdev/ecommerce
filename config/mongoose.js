module.exports = (config, init) => {

   const mongoose = require('mongoose');
   mongoose.connect(`mongodb://${config.mongo.host}:${config.mongo.port}/${config.mongo.db}`);

   // Try to connect
   const db = mongoose.connection;
   db.on('error', console.error.bind(console, 'connection error:'));
   db.once('open', function() {

      // Determine method to include and retun model from file
      function getModel(name) {
         const fs = require('fs');
         const path = `${config.root_dir}/app/models/` + name.toLowerCase() + '.js';

         return new Promise((res, rej) => {
            fs.access(path, fs.R_OK, (err) => {
              if (err) {
                 rej(false);
                 return console.error(err);
              }
              res(require(path)(mongoose));
            });
         });
      }

      // Attach this method
      const Proxy = require('harmony-proxy');
      const trappedMongoose = Proxy(mongoose, {
         get: (mongoose, propName) => {
            return (
               propName in mongoose ? mongoose[propName] : getModel(propName)
            );
         }
      });

      // Run primary part of application
      init(trappedMongoose);
      console.log('MongoDB has been connected!');
   });
};

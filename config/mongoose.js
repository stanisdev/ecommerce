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

      mongoose._models = {};

      // Include models
      fs.readdirSync(models)
         .filter(file => ~file.search(/^[^\.].*\.js$/))
         .forEach(file => {
            let model = require(join(models, file))(mongoose);
            let modelName = (file = file.slice(0, -3), file.charAt(0).toUpperCase() + file.substr(1));
            mongoose._models[modelName] = model;
         });

      const trappedMongoose = new Proxy(mongoose, {
         get: (mongoose, propName) => {
            return propName in mongoose ? mongoose[propName] : getModel(propName);
         }
      });

      // Define method to get model
      function getModel(name) {
         if (!mongoose._models.hasOwnProperty(name)) {
            throw new Error('There is no such model or property in mongoose-object');
         }
         return mongoose._models[name];
      }

      // Run primary part of application
      init(trappedMongoose);
      console.log('MongoDB has been connected!');
   });
};

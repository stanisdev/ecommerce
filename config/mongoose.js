'use strict';

const glob = require('glob');

module.exports = (config) => {
  return new Promise(function (resolve, reject) {
    var mongoose = require('mongoose');
    mongoose.Promise = Promise;
    mongoose.connect(`mongodb://${config.mongo.host}:${config.mongo.port}/${config.mongo.db}`);
    //mongoose.set('debug', true);

    const db = mongoose.connection;
    db.on('error', reject);
    db.once('open', function() {
      const models = glob.sync(config.app_dir + '/models/*.js');
      models.forEach(model => {
        require(model)(mongoose, config);
      });
      console.log('MongoDB has been connected!');
      resolve(mongoose);
    });
  });
};

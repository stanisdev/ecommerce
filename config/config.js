'use strict';

const path = require('path');

const config = {
   express: {
      port: 5001
   },
   mongo: {
      host: 'localhost',
      port: 27017,
      db: 'ecommerce'
   },
   root_dir: path.join(__dirname, '..')
};

module.exports = config;

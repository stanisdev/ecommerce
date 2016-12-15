'use strict';

const path = require('path');
const rootDir = path.dirname(__dirname);

module.exports = {
   express: {
      port: process.env.PORT || 5001
   },
   mongo: {
      host: 'localhost',
      port: 27017,
      db: 'ecommerce'
   },
   root_dir: rootDir,
   dir: __dirname,
   app_dir: path.join(rootDir, 'app'),
   env: process.env.NODE_ENV || 'development',
   goods: {
     per_page: 3
   }
};

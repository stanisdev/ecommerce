'use strict';

const config = require(__dirname + '/config/config');
const app = require(__dirname + '/config/express')(config);
const co = require('co-express');

// Connect to MongoDB
require(__dirname + '/config/mongoose')(config, init);

// Include controllers and middlewares
function init(mongoose) {
   require(__dirname + '/config/middlewares/menu-navigation')(app, co, mongoose);
   require(__dirname + '/app/controllers/main')(app, co, mongoose);
}

// Listen
app.listen(config.express.port, function () {
  console.log(`App listening on port ${config.express.port}!`);
});

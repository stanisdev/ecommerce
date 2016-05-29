'use strict';

// Dependencies
const config = require(__dirname + '/config/config');
const app = require(__dirname + '/config/express')(config);
const port = process.env.PORT || config.express.port;

// Connect to MongoDB
require(__dirname + '/config/mongoose')(config, init);

// Include controllers and middlewares
function init() {
   require(__dirname + '/config/middlewares/primary')(app);
   require(__dirname + '/config/routes')(app, config);
}

// Listen
app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});

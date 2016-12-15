'use strict';

module.exports = function (app, express, mongoose, wrap, config) {

  var router = express.Router();

  /**
   * Index page
   */
  router.get('/', wrap(async function(req, res) {
    res.render('main/index');
  }));

  app.use('/', router);
};

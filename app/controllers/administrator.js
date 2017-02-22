'use strict';

module.exports = function (app, express, mongoose, wrap, config, passport) {

  var router = express.Router();

  /**
   * Index page
   */
  router.get('/login', wrap(async function(req, res) {
     if (req.isAuthenticated()) {
        return res.redirect('/administrator/protected');
     }
     res.render('administrator/login', {});
  }));

  /**
   * Login (post)
   */
  router.post('/login', passport.authenticate('local', {
     successRedirect: '/administrator/protected',
     failureRedirect: '/administrator/login'
   }));

  /**
   * Protected page
   */
  router.get('/protected', passport.authMiddleware, wrap(async function(req, res) {
     res.render('administrator/protected', {});
  }));

  router.get('/logout', function(req, res){
     req.logout();
     res.redirect('/administrator/login');
  });

  app.use('/administrator', router);
};

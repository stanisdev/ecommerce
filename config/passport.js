'use strict';

module.exports = (app, mongoose, config) => {

   /**
    * Dependencies.
    */
   const session = require('express-session');
   const RedisStore = require('connect-redis')(session);
   const passport = require('passport');
   const LocalStrategy = require('passport-local').Strategy;

   // Redis connection
   app.use(session({
      store: new RedisStore({
         host: config.redis.host,
         port: config.redis.port
      }),
      secret: config.redis.secret,
      resave: false,
      saveUninitialized: false
   }));

   app.use(passport.initialize());
   app.use(passport.session());

   // Passport config
   passport.use(new LocalStrategy(function(username, password, done) {
      mongoose.model("Administrator").findOne({username}).exec().then(admin => {
         if (admin instanceof Object && admin.isPasswordValid(password) === true) {
            return done(null, {id: admin._id});
         }
         done(null, false, {message: "Wrong username/password"});
      });
   }));

   passport.serializeUser(function(user, done) {
      done(null, user.id);
   });

   passport.deserializeUser(function(id, done) {
      mongoose.model("Administrator").findOne({_id: id}).exec().then(admin => {
         const err = admin instanceof Object ? (admin = {id: admin._id, username: admin.username, isAdmin: true}, null) : true;
         done(err, admin);
      });
   });

   passport.authMiddleware = function(req, res, next) {
      if (req.isAuthenticated() && req.user.isAdmin === true) {
         return next();
      }
      res.redirect('/administrator/login');
   };

   return passport;
};

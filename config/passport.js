'use strict';

module.exports = (app, mongoose, config) => {

   /**
    * Dependencies.
    */
   const session = require('express-session');
   const RedisStore = require('connect-redis')(session);
   const passport = require('passport');
   const LocalStrategy = require('passport-local').Strategy;
   const flash = require('flash');
   var sessionCopy;

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
   app.use((req, res, next) => {
      req.session.passportMessage = (() => {
         var obj = {};
         Object.defineProperty(obj, 'value', {
            enumerable: false,
            configurable: false,
            get() {
               let value = req.session.tmp;
               delete req.session.tmp;
               return typeof value == "string" ? value : "";
            },
            set(newValue) {
               req.session.tmp = newValue;
            }
         });
         return obj;
      })();
      sessionCopy = req.session;
      next();
   });
   app.use(flash());
   app.use(function(req, res, next) {
      res.locals.getFlashMessage = function() {
         let messages = req.session.flash;
         if (!Array.isArray(messages) || messages.length < 1) {
            return { message: "", type: "" };
         }
         req.session.flash = [];
         return messages[0];
      };
      next();
   });

   // Passport config
   passport.use(new LocalStrategy(function(username, password, done) { // While authorization (once)
      mongoose.model("Administrator").findOne({username}).exec().then(admin => {
         if (admin instanceof Object && admin.isPasswordValid(password) === true) {
            return done(null, {id: admin._id});
         }
         sessionCopy.passportMessage.value = "Wrong username/password";
         done(null, false, {});
      });
   }));

   passport.serializeUser(function(user, done) {
      done(null, user.id);
   });

   passport.deserializeUser(function(id, done) { // It is invoked every time when we render "administrator" route
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

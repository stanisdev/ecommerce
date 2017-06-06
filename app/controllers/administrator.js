'use strict';

const _ = require('lodash');
const randomString = require("randomstring");

module.exports = function (app, express, mongoose, wrap, config, passport) {

   var router = express.Router();
   const serviceOther = require(config.app_dir + '/services/other');

   /**
    * Login form
    */
   router.get('/login', wrap(async function(req, res) {
      if (req.isAuthenticated()) {
         return res.redirect('/administrator');
      }
      res.render('administrator/login', {passportMessage: req.session.passportMessage.value});
   }));

   /**
    * Login (post)
    */
   router.post('/login', passport.authenticate('local', {
      successRedirect: '/administrator',
      failureRedirect: '/administrator/login'
   }));

   /**
    * Logout page
    */
   router.get('/logout', function(req, res){
      req.logout();
      res.redirect('/administrator/login');
   });

   /**
    * Main admin page
    */
   router.get('/', passport.authMiddleware, wrap(async function(req, res) {
      res.render('administrator/index', {});
   }));

   /**
    * Profile
    */
   router.get('/profile', passport.authMiddleware, wrap(async function(req, res) {
      res.render('administrator/profile', {});
   }));

   /**
    * Profile
    */
   router.post('/profile/save', passport.authMiddleware, wrap(async function(req, res) {
      const fields = ["currentPassword", "newPassword", "confirmPassword"];
      const emptyFields = fields.filter(e => typeof req.body[e] != "string" || req.body[e].length < 1);
      const end = (type, messages) => {
         req.flash(type, messages);
         res.redirect("/administrator/profile");
      };

      if (_.difference(fields, Object.keys(req.body)).length > 0 || emptyFields.length > 0) {
         return end("danger", "Following fields are empty: " + emptyFields.join(", "));
      }
      if (req.body.newPassword !== req.body.confirmPassword) {
         return end("danger", "New password and its confirm does not equal");
      }
      const admin = await mongoose.model("Administrator").findOne({ _id: req.user.id }).select("id password salt").exec();
      if (!(admin instanceof Object)) {
         return end("danger", "Password cannot be updated");
      }
      if (!admin.isPasswordValid(req.body.currentPassword)) {
         return end("danger", "Entered invalid current password");
      }
      const salt = randomString.generate(30);
      await admin.set({
         password: mongoose.model("Administrator").generateBcryptHash(req.body.newPassword, salt),
         salt: salt
      }).save();
      end("success", "Password has been saved");
   }));

   /**
    * List of categories
    */
   router.get('/categories', passport.authMiddleware, wrap(async function(req, res) {
      let categories = await mongoose.model("Category")
         .find({})
         .select("_id title url enabled")
         .exec();
      const totalAmount = await mongoose.model("Category").count().exec();
      categories = await Promise.all(categories.map(async (category) => {
         category.subcatsCount = await mongoose.model("Subcategory").count({ _category: category.id }).exec();
         return category;
      }));
      res.render('administrator/categories', {categories, totalAmount});
   }));

   /**
    * New category (GET)
    */
   router.get('/categories/new', passport.authMiddleware, wrap(async function(req, res) {
      res.render('administrator/category-form', {});
   }));

   /**
    * New category (GET)
    */
   router.post('/categories/new', passport.authMiddleware, wrap(async function(req, res) {
      const category = new (mongoose.model("Category"))(req.body);
      try {
         await category.save();
      } catch (output) {
         res.render('administrator/category-form', { errors: serviceOther.validationErrorsPrepare(output) });
      }
   }));

   app.use('/administrator', router);
};

'use strict';

const _ = require('lodash');
const randomString = require("randomstring");
const path = require('path');
const multer = require('multer');
const imageSizeOf = require('image-size');
const sharp = require('sharp');
const fs = require('fs');

let dirs = __dirname.split("/");
dirs.pop();
const servicesDir = dirs.join("/") + "/services";
const BaseRouter = require(servicesDir + "/baseRouter");
dirs.pop();
const rootDir = dirs.join("/");
const imagesCategory = `${rootDir}/public/images/categories`;
const upload = multer({
   dest: imagesCategory,
   fileFilter: function(req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
         return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
   }
});

/**
 * Admin class
 */
class Administrator extends BaseRouter {
   constructor() {
      super();
      this.build.apply(this, arguments);
      this.services.other = require(this.config.app_dir + '/services/other');
   }

   /**
    * Get list of all admin handlers
    */
   getMethods() {
      const passport = this.passport;
      const auth = passport.authMiddleware;
      return [
         { name: "main", url: "", filters: [auth] },
         { name: "login", url: "login" },
         { name: "loginPost", url: "login", filters: [passport.authenticate('local', {
                  successRedirect: '/administrator',
                  failureRedirect: '/administrator/login'
               })
            ]
         },
         { name: "logout", url: "logout", filters: [auth] },
         { name: "profile", url: "profile", filters: [auth] },
         { name: "profileSavePost", url: "profile/save", filters: [auth] },
         { name: "categories", url: "categories", filters: [auth] },
         { name: "categoryNew", url: "categories/new", filters: [auth] },
         { name: "categoryNewPost", url: "categories/new", filters: [auth] },
         { name: "categoryRemove", url: "category/:id/remove", filters: [auth] },
         { name: "uploadPicturePost", url: "upload-picture", filters: [auth, upload.single("image")] }
      ];
   }

   /**
    * Main admin page
    */
   main() {
      this.render('index', {});
   }

   /**
    * Login form
    */
   login() {
      if (this.req.isAuthenticated()) {
         return this.redirect('/');
      }
      this.render('login', { passportMessage: this.req.session.passportMessage.value });
   }

   /**
    * Login (post)
    */
   loginPost() {}

   /**
    * Logout page
    */
   logout() {
      this.req.logout();
      this.redirect('/login');
   }

   /**
    * Profile
    */
   profile() {
      this.render('profile', {});
   }

   /**
    * Profile save (POST)
    */
    async profileSavePost() {
      const fields = ["currentPassword", "newPassword", "confirmPassword"];
      const emptyFields = fields.filter(e => typeof this.body[e] != "string" || this.body[e].length < 1);
      const end = (type, message) => {
         this.redirect("/profile", {flash: {type, message}});
      };

      if (_.difference(fields, Object.keys(this.body)).length > 0 || emptyFields.length > 0) {
         return end("danger", "Following fields are empty: " + emptyFields.join(", "));
      }
      if (this.body.newPassword !== this.body.confirmPassword) {
         return end("danger", "New password and its confirm does not equal");
      }
      const admin = await this.model("Administrator").findOne({ _id: this.user.id }).select("id password salt").exec();
      if (!(admin instanceof Object)) {
         return end("danger", "Password cannot be updated");
      }
      if (!admin.isPasswordValid(this.body.currentPassword)) {
         return end("danger", "Entered invalid current password");
      }
      const salt = randomString.generate(30);
      await admin.set({
         password: this.model("Administrator").generateBcryptHash(this.body.newPassword, salt),
         salt: salt
      }).save();
      end("success", "Password has been saved");
   }

   /**
    * List of categories
    */
   async categories() {
      let categories = await this.model("Category")
         .find({})
         .select("_id title url enabled")
         .exec();
      const totalAmount = await this.model("Category").count().exec();
      categories = await Promise.all(categories.map(async (category) => {
         category.subcatsCount = await this.model("Subcategory").count({ _category: category.id }).exec();
         return category;
      }));
      const firstCategoryId = Array.isArray(categories) && categories.length > 0 ? categories[0]._id : null;
      this.render('categories', {categories, totalAmount, firstCategoryId});
   }

   /**
    * New category
    */
   categoryNew() {
      this.render('category-form', {data: {}, errors: []});
   }

   /**
    * New category (POST)
    */
   async categoryNewPost() {
      const category = new (this.model("Category"))(this.body);
      try {
         await category.validate();
         const oldFile = imagesCategory + "/" + this.body.image;
         const newFile = imagesCategory + "/" + category.url + "." + this.body["image-extension"];
         fs.rename(oldFile, newFile, async (err) => {
             if (err) {
                return this.res.send("Category image was not uploaded");
             }
             await category.save();
             this.redirect("/categories", {flash: {type: "success", message: "Category added"}});
         });
      } catch (output) {
         this.render('category-form', {
            errors: this.services.other.validationErrorsPrepare(output),
            data: this.body
         });
      }
   }

   /**
    * Remove category
    */
   async categoryRemove() {
      const id = this.req.params.id;
      if (typeof id != "string" || id.length < 1) {
         return this.redirect("/categories", {flash: {type: "danger", message: "Id of category is incorrect"}});
      }
      const category = await this.model("Category").findOne({ _id: id }).exec();
      if (!(category instanceof Object)) {
         return this.redirect("/categories", {flash: {type: "danger", message: "Category not found"}});
      }
      await this.model("Category").remove({ _id: category.id }).exec();
      return this.redirect("/categories", {flash: {type: "success", message: "Category was removed"}});
   }

   /**
    * Remove category
    */
   uploadPicturePost() {
      const file = this.req.file;
      const extension = path.parse(file.originalname).ext.substr(1);
      imageSizeOf(file.path, (err, dimensions) => {
         if (err) {
            return this.res.json({
               success: false,
               message: "Dimensions of image cannot be detected"
            });
         }
         if (dimensions.width < 125) {
            return this.res.json({
               success: false,
               message: "Image width must be more then or equal 125px"
            });
         }
         const end = () => {
            this.res.json({
               success: true,
               filename: file.filename,
               extension: extension
            });
         };
         if (dimensions.width == 125) {
            return end();
         }
         // Crop image
         const path = imagesCategory + "/" + file.filename;
         sharp(file.path).resize(125).toFile(path + "125", function(err) {
            if (err) {
               return this.res.json({
                  success: false,
                  message: "Image cannot be resized"
               });
            }
            fs.unlink(path, function() {
               file.filename += "125";
               end();
            });
         });
      });
   }
}

module.exports = function (app, express, mongoose, wrap, config, passport) {
   new Administrator(app, express, mongoose, wrap, config, passport, "/administrator");
};

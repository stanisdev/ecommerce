'use strict';

var bcrypt = require('bcrypt');

module.exports = (mongoose) => {

   // Define schema
   const administratorSchema = mongoose.Schema({
      username: {
         type: String,
         required: true,
         unique: true
      },
      password: {
         type: String,
         required: true
      },
      salt: {
         type: String,
         required: true
      }
   });

   // Static methods
   administratorSchema.statics = {

      /**
       * Generate bcrypt hash
       */
      generateBcryptHash(password, salt) {
         return bcrypt.hashSync(password + salt, bcrypt.genSaltSync(10));
      }
   };

   // Instance methods
   administratorSchema.methods = {

      /**
       * Compare enterd password with hash
       */
      isPasswordValid(password) {
         return bcrypt.compareSync(password + this.salt, this.password);
      }
   };

   mongoose.model('Administrator', administratorSchema);
};

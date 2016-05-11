'use strict';

module.exports = (mongoose) => {

   // Define schema
   var categorySchema = mongoose.Schema({
      title: {
         type: String,
         required: true,
         unique: true
      },
      url: {
         type: String,
         required: true,
         unique: true
      },
      subcategory: [{
         title: {type: String, required: true},
         url: {type: String, required: true, unique: true},
         enabled: {type: Boolean, default: true}
      }],
      enabled: {
         type: Boolean,
         default: true
      }
   });

   return mongoose.model('Category', categorySchema);
};

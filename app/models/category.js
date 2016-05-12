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
         goods: [{
            title: {type: String, required: true},
            price: {type: Number, required: true},
            discount: {type: Number, default: 0},
            isSold: {type: Boolean, default: true},
            brands: [String],
            pictures: [String],
            description: String,
            tags: [String]
         }],
         enabled: {type: Boolean, default: true}
      }],
      enabled: {
         type: Boolean,
         default: true
      }
   });

   // Static methods
   categorySchema.statics = {

      // List goods
      list(category) {
         return this
            .find({url: category, enabled: true})
            .exec();
      }
   };

   return mongoose.model('Category', categorySchema);
};

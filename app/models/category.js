'use strict';

module.exports = (mongoose) => {

   // Define schema
   const categorySchema = mongoose.Schema({
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
      subcategories: [{
         type: mongoose.Schema.ObjectId,
         ref: 'Subcategory'
      }],
      enabled: {
         type: Boolean,
         default: true
      }
   });

   // Static methods
   categorySchema.statics = {

      /**
       * Get categories and subcategories for menu navigation
       */
      getAllCategoriesAndSubcats() {
         return this
            .find({enabled: true})
            .populate({
               path: 'subcategories',
               select: 'title url',
               match: {enabled: true}
            })
            .select('title url subcategories')
            .exec();
      },

      /**
       * Find goods list found by category name
       */
      findGoodsByCategeoryUrl(page, category, mongoose) {

         return new Promise((resolve, reject) => {
            this
               .findOne({ url: category, enabled: true })
               .populate({
                  path: 'subcategories',
                  match: { enabled: true },
                  select: '_id title url'
               })
               .select('title url subcategories')
               .exec((err, category) => {

                  if (err || !category || Object.keys(category).length < 1 || category.subcategories.length < 1) {
                     return resolve(false);
                  }

                  // Prepare result object
                  const _ = require('lodash');
                  const keys = category.subcategories.map(e => e._id);
                  const data = {
                     category: { _id: category._id, title: category.title, url: category.url },
                  };

                  resolve({data, keys, category});
               });
         });
      },

      /**
       * Find category containing subcategory-id inside subcategories-array
       */
      findCategoryBySubcategoryId(id, cb) {
         this
            .findOne({subcategories: id})
            .select('title url')
            .exec(cb);
      },

      /**
       * Find list of subcategories by given category_id
       */
      findAllSubcategoriesByCategoryId(id) {
         return this
            .findOne({_id: id, enabled: true})
            .populate({
               path: 'subcategories',
               match: {enabled: true},
               select: 'url title'
            })
            .select('subcategories')
            .exec();
      }
   };

   return mongoose.model('Category', categorySchema);
};

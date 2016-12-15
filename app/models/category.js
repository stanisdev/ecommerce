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

   mongoose.model('Category', categorySchema);
};

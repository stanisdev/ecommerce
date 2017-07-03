'use strict';

module.exports = (mongoose) => {

   // Define schema
   const categorySchema = mongoose.Schema({
      title: {
         type: String,
         required: true,
         unique: true,
         trim: true,
         minlength: [3, "Title length too short"],
         maxlength: [30, "Title length too long"]
      },
      url: {
         type: String,
         required: true,
         unique: true,
         trim: true,
         lowercase: true,
         minlength: [3, "Url length too long"],
         maxlength: [50, "Url length too long"],
         validate: function(value, callback) {
            mongoose.model("Category").findOne({ url: value }).then((data) => {
               if (data instanceof Object) {
                  return callback(false, "Title already exists");
               }
               callback();
            }).catch(callback);
         }
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

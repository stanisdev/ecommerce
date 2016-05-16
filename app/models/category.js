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
         url: {type: String, required: true},
         enabled: {type: Boolean, default: true},
         goods: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Goods'
         }]
      }],
      enabled: {
         type: Boolean,
         default: true
      }
   });

   // Static methods
   categorySchema.statics = {

      /**
       * Get one category
       */
      findCategoryByUrl(category) {
         return this
            .findOne({url: category, enabled: true})
            .select('title url')
            .exec();
      },

      /**
       * Find and get category and appropriate subcategory title with url
       */
      findSubcategoryByGoodsId(categoryId, goodsId) {
         /**
          * Of course, we can use additional external key "_subcategory = category.subcategoryID"
          * inside "Goods" collection and the query would be less and retrieving data would be faster.
          * But in this case we pursue likely demonstration purposes :-)
          */
         return this.aggregate([
            { $match : { _id : categoryId, enabled: true } },
            { $unwind: "$subcategory" },
            { $match: {
                  "subcategory.goods": goodsId,
                  "subcategory.enabled": true
               }
            },
            { $project : {
                  title : 1,
                  url: 1,
                  'subcategory.title': 1,
                  'subcategory.url': 1
               }
            }
         ]).exec();
      },

      /**
       * Get categories and subcategories for menu navigation
       */
      getAllCategoriesAndSubcats() {
         return this.aggregate([
            { $match : { enabled : true } },
            { $unwind : '$subcategory' },
            { $match : { 'subcategory.enabled' : true } },
            { $group: {
                  _id: { catTitle: '$title', catUrl: '$url' },
                  subcat: {
                     $push: {url: '$subcategory.url', title: '$subcategory.title'}
                  }
               }
            },
            { $sort : { '_id.catUrl' : 1 } }
         ]).exec();
      },
   };

   return mongoose.model('Category', categorySchema);
};

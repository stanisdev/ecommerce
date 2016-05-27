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
      findGoodsByCategeoryName(page, options, category, mongoose) {

         return new Promise((resolve, reject) => {
            this
            .findOne({ url: category, enabled: true })
            .populate({
               path: 'subcategories',
               match: { enabled: true },
               select: '_id title url'
            })
            .select('title url subcategories')
            .exec(function (err, category) {

               if (err || !category || Object.keys(category).length < 1 || category.subcategories.length < 1) {
                  return resolve(false);
               }

               // Prepare result object
               const _ = require('lodash');
               const keys = category.subcategories.map(e => e._id);
               const data = {
                  category: { title: category.title, url: category.url },
               };

               // Find goods by subcategories id
               mongoose.Goods.findGoodsBySubcategoryIds(page, options, keys, (goods) => {
                  const uniqSubcats = _.uniq(goods.map(e => e._subcategory._id));

                  const values = category.subcategories.map(e => {
                     return { title: e.title, url: e.url };
                  });

                  data.subcategories = _.pick(_.zipObject(keys, values), uniqSubcats);;
                  data.goods = goods;

                  // Fugire out total count of goods by subcategy-ids
                  mongoose.Goods.getCountOfGoodsBySubcategoryIds(keys, (err, count) => {
                     if (err) throw new Error('Total count of goods cannot be calculated');
                     data.goodsTotalCount = count;
                     resolve(data);
                  });
               });
            });
         });
      }
   };

   return mongoose.model('Category', categorySchema);
};

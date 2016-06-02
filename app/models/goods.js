'use strict';

module.exports = (mongoose) => {

   // Schema
   const goodsSchema = mongoose.Schema({
      title: {
         type: String,
         required: true
      },
      price: {
         type: Number,
         required: true
      },
      discount: {
         type: Number,
         default: 0
      },
      isSold: {
         type: Boolean,
         default: true
      },
      enabled: {
         type: Boolean,
         default: true
      },
      _subcategory: {
         type: mongoose.Schema.ObjectId,
         ref: 'Subcategory'
      },
      brands: [String],
      pictures: [String],
      description: String,
      tags: [String],
      createdAt: {
         type : Date,
         default : Date.now
      }
   });

   // Static methods
   goodsSchema.statics = {

      /**
       * Get overal count of goods belong certan subcategories
       */
      getCountOfGoodsBySubcategoryIds(ids) {
         return this
            .count({_subcategory: { $in: ids }, enabled: true})
            .exec();
      },

      /**
       * Find goods by list of subcategory-ids
       */
      findGoodsBySubcategoryIds(page, options, ids, category) {
         const query = this
            .find({ enabled: true, _subcategory: { $in: ids } })
            .populate({
               path: '_subcategory',
               select: '_id',
            })
            .select('title price discount _subcategory')
            .limit(3)
            .skip(page * 3);

         // Set up filter-options
         require('./../helpers/category').setOptionsParam(query, options);

         return new Promise((resolve, reject) => {
            query.exec((err, goods) => {
               if (err) throw new Error('Goods cannot be found');

               const _ = require('lodash');
               const uniqSubcats = _.uniq(goods.map(e => e._subcategory._id));
               const values = category.subcategories.map(e => {
                  return { title: e.title, url: e.url };
               });

               const data = {};
               data.subcategories = _.pick(_.zipObject(ids, values), uniqSubcats);;
               data.goods = goods;
               resolve(data);
            });
         });
      },

      /**
       * Find one goods by id
       */
      findOneGoodsById(id, mongoose) {
         return new Promise((resolve, reject) => {

            this
               .findOne({_id: id})
               .populate('_subcategory', 'title url')
               .select('title price description tags brands isSold discount _subcategory')
               .exec((err, goods) => {
                  if (err || !goods) return resolve(false);

                  // Find category info
                  mongoose.Category.findCategoryBySubcategoryId(goods._subcategory._id, (err, category) => {

                     if (err || !category) return resolve(false);
                     resolve({goods, category});
                  });
               });
         });
      },

      /**
       * Get totol count of goods in each subcategory
       */
      getTotalCountGoodsBySubcategoryId(ids) {
         return this
            .aggregate([
               { $match: {
                     enabled: true,
                     _subcategory: { $in: ids }
                  }
               },
               { $group: {
                  _id: "$_subcategory",
                     goodsCount: { $sum: 1 }
                  }
               }
            ])
            .exec();
      }
   }

   return mongoose.model('Goods', goodsSchema);
};

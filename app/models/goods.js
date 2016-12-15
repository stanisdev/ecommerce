'use strict';

/**
 * Dependencies
 */
const _ = require('lodash');

module.exports = (mongoose, config) => {

   const serviceCategory = require(config.app_dir + '/services/category');

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
      findGoodsBySubcategoryIds(page, options, ids, category, isApi) {
         const query = this
            .find({ enabled: true, _subcategory: { $in: ids } })
            .populate({
               path: '_subcategory',
               select: '_id',
            })
            .select('title price discount _subcategory')
            .limit(config.goods.per_page)
            .skip(page * config.goods.per_page);

         // Set up filter-options
         serviceCategory.setOptionsParam(query, options);

         if (isApi) {
            return query.exec();
         }
         return new Promise((resolve, reject) => {
            query.exec().then(goods => {
              //const uniqSubcats = _.uniq(goods.map(e => e._subcategory._id));
              //const values = category.subcategories.map(e => ({ title: e.title, url: e.url }));

              const data = {
                //subcategories: _.pick(_.zipObject(ids, values), uniqSubcats),
                goods: goods
              };
              resolve(data);
            }).catch(reject);
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
                  mongoose.model('Category').findCategoryBySubcategoryId(goods._subcategory._id, (err, category) => {

                     if (err || !category) return resolve(false);
                     resolve({goods, category});
                  });
               });
         });
      },

      /**
       * Get total count of goods in each subcategory
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
      },

      /**
       * Find all brands by list of subcategories ids
       */
      getAllBrandsBySubcategoryIds(ids) {
         return this
            .aggregate([
               { $match: {
                     enabled: true,
                     _subcategory: {
                        $in: ids
                     }
                  }
               },
               { $group: { _id: "$brands" } },
               { $unwind: "$_id" },
               { $group: { _id: "$_id" } }
            ])
            .exec();
      },

      /**
       * To aggregate count of discounts
       */
      getAggregatedDiscountsCount(ids) {
         return this
            .aggregate([
               { $match: {
                     enabled: true,
                     _subcategory: {
                        $in: ids
                     }
                  }
               },
               { $project: {
                  item: 1,
                  discount: {
                     $cond: {
                        if: { $gte: [ "$discount", 50 ] }, // > 50 || 30 <= X < 40
                        then: 5,
                        else: {
                           $cond: {
                              if: { $lte: [ "$discount", 10 ] },  // <= 10
                              then: 1,
                              else: {
                                 $cond: {
                                    if: { $and: [{$lt: [ "$discount", 20 ]}, {$gte: [ "$discount", 10 ]}] }, // 10 <= X < 20
                                    then: 4,
                                    else: {
                                       $cond: {
                                          if: { $and: [{$lt: [ "$discount", 30 ]}, {$gte: [ "$discount", 20 ]}] }, // 20 <= X < 30
                                          then: 3,
                                          else: {
                                             $cond: {
                                                if: { $and: [{$lt: [ "$discount", 50 ]}, {$gte: [ "$discount", 40 ]}] }, // 40 <= X < 50
                                                then: 4,
                                                else: 5
                                             }
                                          }
                                       }
                                    }
                                 }
                              }
                           }
                        }
                     }
                  }
               }
               },
               { $group: {
                  _id: "$discount",
                  count: {
                     $sum: 1
                  }
               }
            }])
         .exec();
      }
   }

   mongoose.model('Goods', goodsSchema);
};

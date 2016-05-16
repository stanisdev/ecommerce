'use strict';

module.exports = (mongoose) => {

   // Schema
   var goodsSchema = mongoose.Schema({
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
      _category: {
         type: mongoose.Schema.ObjectId,
         ref: 'Category'
      },
      brands: [String],
      pictures: [String],
      description: String,
      tags: [String]
   });

   // Static methods
   goodsSchema.statics = {

      /**
       * Find list of goods by categoryId
       */
      findGoodsByCategoryId(categoryId, page) {
         return this
            .find({_category: categoryId, enabled: true})
            .select('title price isSold discount')
            .exec();
      },

      /**
       * Find goods by its id
       */
      findOneGoodsById(goodsId, selectOptions) {
         var id = new mongoose.Types.ObjectId(goodsId);
         return this
            .findOne({_id: goodsId, enabled: true})
            .select(selectOptions)
            .exec();
      }
   }

   return mongoose.model('Goods', goodsSchema);
};

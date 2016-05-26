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
      _category: {
         type: mongoose.Schema.ObjectId,
         ref: 'Category'
      },
      _subcategory: {
         type: mongoose.Schema.ObjectId,
         ref: 'Category.subcategory'
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
       * Find list of goods by categoryId
       */
      findGoodsByCategoryId(categoryId, page, options) {
         const query = this
            .find({_category: categoryId, enabled: true})
            .select('discount title price isSold')
            .skip(page * 3)
            .limit(3);

         require('./../helpers/category').setOptionsParam(query, options);
         return query.exec();;
      },

      /**
       * Find goods by its id
       */
      findOneGoodsById(goodsId, selectOptions) {
         const id = new mongoose.Types.ObjectId(goodsId);
         return this
            .findOne({_id: goodsId, enabled: true})
            .select(selectOptions)
            .exec();
      },

      /**
       * Get overal count of goods belongs certan category
       */
      getCountOfGoodsByCategoryId(catId) {
         const categoryId = new mongoose.Types.ObjectId(catId);
         return this
            .count({_category: categoryId, enabled: true})
            .exec();
      }
   }

   return mongoose.model('Goods', goodsSchema);
};

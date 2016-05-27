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
      getCountOfGoodsBySubcategoryIds(ids, cb) {
         return this
            .count({_subcategory: { $in: ids }, enabled: true})
            .exec(cb);
      },

      /**
       * Find goods by list of subcategory-ids
       */
      findGoodsBySubcategoryIds(page, options, ids, cb) {
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

         query.exec(function(err, goods) {
            if (err) throw new Error('Goods cannot be found');
            cb(goods);
         });
      }
   }

   return mongoose.model('Goods', goodsSchema);
};

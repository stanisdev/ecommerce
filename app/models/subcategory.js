module.exports = (mongoose) => {

   // Schema
   const subcategorySchema = mongoose.Schema({
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
      goods: [{
         type: mongoose.Schema.ObjectId,
         ref: 'Goods'
      }],
      _category: {
         type: mongoose.Schema.ObjectId,
         ref: 'Category'
      },
      enabled: {
         type: Boolean,
         default: true
      },
   });

   subcategorySchema.statics = {

      findAllGoodsByCategeoryName(category) {
         return this
            .find({enabled: true})
            .populate('_category', 'title url')
            .exec();
      }
   };

   return mongoose.model('Subcategory', subcategorySchema);
};

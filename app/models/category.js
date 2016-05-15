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

      getSubcategoryInfoByGoodsId(goodsId) {
         db.categories.aggregate([
             { $match : { _id : ObjectId("57382c71164178865d9dc374") } },
             {
                 $group : {
                    _id : '$title',
                    subcat: {$push: {item: '$subcategory'}}
                 }
             },
             { $unwind : "$subcat" },
             { $unwind : "$subcat.item" },
             { $match : { 'subcat.item.goods' : ObjectId("57382c71164178865d9dc377"), 'subcat.item.enabled': true } },
             {
                 $group : {
                    _id : {catTitle: '$_id', subcatTitle: '$subcat.item.title', subcatUrl: '$subcat.item.url'}
                 }
             }
         ]);
      }

      /**
       * Get data for menu navigation
       */
      menuNavigation(cb) {
         var mr = {
            map: function() {
               if (this.enabled)
                  emit({url: this.url, title: this.title}, {subcategory: this.subcategory});
            },
            finalize: function (key, redValue) {
               var subcats = redValue.subcategory
                  .map(function(e) {
                     return {url: e.url, title: e.title, enabled: e.enabled};
                  })
                  .filter(function(e) {
                     return e.enabled;
                  });
               return {url: key.url, title: key.title, subcategory: subcats};
            },
            reduce: function () {}
         };
         this.mapReduce(mr, function (err, result) {
            if (err) return console.error(err);
            cb(result.map(e => e.value));
        });
      },

      /**
       * Update goods by ObjectId
       */
      updateGoods() {

         // Update by index array of goods
         db.categories.update(
            {
               url: 'mens',
               'subcategory.url': 'pants',
               'subcategory.goods._id': ObjectId("573590a2fe2a71ea0e2123ad")
            },
            {$set : {"subcategory.$.goods.1.price": 82}}
         );

         // Retrieve index of element's array
         var map = function() {
            if (this.enabled && this.url == 'mens') emit({}, {subcategory: this.subcategory});
         };
         var reduce = function() {};
         var finalize = function(key, doc) {
            var res = doc.subcategory.filter(function(e) {return e.url === 'pants';})[0].goods;
            var key = res.reduce(function(prev, curr, currIndex) {
               if (curr._id == '573590a2fe2a71ea0e2123ad') {
                  prev = currIndex;
               }
               return prev;
            }, -1);
            return {result: key};
         };
         db.categories.mapReduce(map, reduce, {finalize: finalize, out: {inline: 1}})
      }
   };

   return mongoose.model('Category', categorySchema);
};

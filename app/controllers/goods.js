'use strict';

module.exports = (app, co, mongoose) => {

   const url = /^\/category\/([a-zA-Z\d_]+)\/goods\/([abcdef\d]{24})$/;

   /**
    * Item of goods
    */
   app.get(url, co(function* (req, res) {
      const _ = require('lodash');
      const goodsId = req.params[1];
      const subcategory = req.params[0];
      const selectOptions = 'title price description tags pictures brands isSold discount _category';
      const goods = yield mongoose.Goods.findOneGoodsById(goodsId, selectOptions);

      if (!goods || !_.isObject(goods) || Object.keys(goods).length < 1) {
         return res.render('main/404');
      }

      // Fins category and subcategory information
      let category = yield mongoose.Category.findSubcategoryByGoodsId(goods._category, goods._id);
      if (!Array.isArray(category) || !(category = _.head(category)) || category.url !== subcategory) {
         return res.render('main/404');
      }
      // result: {category: category, goods: goods}
      res.send('Goods Item');
   }));
};

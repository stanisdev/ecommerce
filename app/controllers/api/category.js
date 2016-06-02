'use strict';

/**
 * Dependencies
 */
const wrap = require('co-express');
const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const Goods = mongoose.model('Goods');

/**
 * Get list of goods as "json"
 */
exports.getPage = wrap(function* (req, res) {
   const params = req.body;
   if (Object.keys(params).length < 1) {
      return res
         .status(500)
         .send('Incorrect post parameters!');
   }

   //const category = yield Category.findGoodsByCategeoryUrl(page, categoryName, mongoose);
   //const goods = yield Goods.findGoodsBySubcategoryIds(page, options, category.keys, category.category);
   //const goodsCount = yield Goods.getCountOfGoodsBySubcategoryIds(category.keys);
   res.json(req.body);
});

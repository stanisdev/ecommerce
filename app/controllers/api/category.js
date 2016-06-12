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
exports.getGoods = wrap(function* (req, res) {
   const params = req.body;
   if (Object.keys(params).length < 1) {
      return res
         .status(500)
         .send('Incorrect post parameters!');
   }

   // Get list of categories
   const subcats = [];
   if (params.types.length > 0) {
      subcats.push(...params.types);
   }
   else {
      const category = yield Category.findAllSubcategoriesByCategoryId(params.categoryId);
      subcats.push(...category.subcategories.map(e => e._id));
   }

   // Get goods by subcategories and filters
   const options = {sort: params.sort, discounts: params.discounts, brands: params.brands};
   const goods = yield Goods.findGoodsBySubcategoryIds(params.page - 1, options, subcats, null, true);
   res.json(goods);
});

'use strict';

/**
 * Dependencies
 */
const _ = require('lodash');
const wrap = require('co-express');
const mongoose = require('mongoose');
const helper = require('./../helpers/category');
const Category = mongoose.model('Category');
const Goods = mongoose.model('Goods');

/**
 * Index page
 */
exports.index = function(req, res) {
   res.render('main/index');
};

/**
 * List of all goods
 */
exports.allGoods = wrap(function* (req, res) {

   // Data preparation
   const categoryName = res.categoryName;
   const page = (req.params[1] ? (req.params[1] - 1) : 0);
   const options = helper.disassemleUrlOptions(req.params[3]);

   // Collect information from DB
   const category = yield Category.findGoodsByCategeoryUrl(page, categoryName, mongoose);
   const goods = yield Goods.findGoodsBySubcategoryIds(page, options, category.keys, category.category);
   const goodsCount = yield Goods.getCountOfGoodsBySubcategoryIds(category.keys);

   let subcats = category.category.subcategories;
   const subcatsGoodsCount = yield Goods.getTotalCountGoodsBySubcategoryId(subcats.map(e => e._id));

   // Prepare subcategory data
   subcats = subcats.map(e => {
      let goodsCount = subcatsGoodsCount.filter(s => ''+s._id == ''+e._id);
      let res = {_id: e._id, title: e.title, url: e.url, goodsCount: goodsCount[0].goodsCount};
      return res;
   });

   const data = Object.assign(category.data, goods);
   data.subcategories = subcats;
   data.goodsTotalCount = goodsCount;

   // Check data on correct values
   if (!data || !_.isObject(data) || Object.keys(data).length < 1 || data.goods.length < 1) {
      return res.render('main/404');
   }
   res.render('category/allGoods', {data});
});

/**
 * Fill DB with demo data
 */
exports.demoData = (() => {
   const helper = require('./../helpers/demoData');
   return wrap(helper.demoData(mongoose, Category, Goods));
})();

// http://localhost:5001/category/mens/options/sort:[4],discounts:[1,3]

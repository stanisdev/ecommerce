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
   const category = yield Category.findGoodsByCategeoryName(page, options, categoryName, mongoose);
   const goods = yield Goods.findGoodsBySubcategoryIds(page, options, category.keys, category.category);
   const goodsCount = yield Goods.getCountOfGoodsBySubcategoryIds(category.keys);
   const data = Object.assign(category.data, goods);

   data.goodsTotalCount = goodsCount;

   // Check data on correct values
   if (!data || !_.isObject(data) || Object.keys(data).length < 1 || data.goods.length < 1) {
      return res.render('main/404');
   }
   res.render('category/allGoods', {data});
});

'use strict';

/**
 * Dependencies
 */
const _ = require('lodash');

/**
 * Routes
 */
module.exports = function (app, express, mongoose, wrap, config) {

   var router = express.Router();

   /**
   * List of all goods
   */
   router.get(/^\/(page\/(\d+))?(\/)?(options\/([a-z]+:\[(\d,?)+\],?)*)?$/, wrap(async function(req, res) {

      // Data preparation
      const categoryName = res.categoryName;
      const page = (req.params[1] ? (req.params[1] - 1) : 0);
      const serviceCategory = require(config.app_dir + '/services/category');
      const options = serviceCategory.disassemleUrlOptions(req.params[3]);
      const Goods = mongoose.model('Goods');

      // Collect information from DB
      const categoriesWithSubcats = app.locals.categoriesWithSubcats;
      const currentCategory = categoriesWithSubcats.find(c => c.url == categoryName && c.subcategories.length > 0);
      if (!(currentCategory instanceof Object)) {
         return res.render('main/404');
      }

      const subcategoryKeys = currentCategory.subcategories.map(e => e._id);
      try {
        var goods = await Goods.findGoodsBySubcategoryIds(page, options, subcategoryKeys, currentCategory);
      } catch(e) {
        return res.json({message: "Error while searching goods"}); // @TODO server error page
      }
      const goodsCount = await Goods.getCountOfGoodsBySubcategoryIds(subcategoryKeys);

      let subcats = currentCategory.subcategories;
      const subcatsGoodsCount = await Goods.getTotalCountGoodsBySubcategoryId(subcats.map(e => e._id));
      console.log(subcategoryKeys);
      const brands = await Goods.getAllBrandsBySubcategoryIds(subcategoryKeys);
      const zzzzzzzzzzzz = await Goods.getAggregatedDiscountsCount(subcategoryKeys);

      // Prepare subcategory data
      subcats = subcats.map(e => {
         let goodsCount = subcatsGoodsCount.filter(s => ''+s._id == ''+e._id);
         let res = {_id: e._id, title: e.title, url: e.url, goodsCount: goodsCount[0].goodsCount};
         return res;
      });

      const data = Object.assign({
        category: { _id: currentCategory._id, title: currentCategory.title, url: currentCategory.url }
      }, goods);
      data.subcategories = subcats;
      data.goodsTotalCount = goodsCount;
      data.brands = brands;

      // Check data on correct values
      if (!data || !_.isObject(data) || Object.keys(data).length < 1 || data.goods.length < 1) {
         return res.render('main/404');
      }
      res.render('category/allGoods', {data});
   }));

   app.use('/category/:categoryName', router);
};

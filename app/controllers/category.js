'use strict';

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

      var subcategoryKeys = subcategoryKeys = currentCategory.subcategories.map(e => e._id); // Filter subcategories
      if (options.hasOwnProperty("types") && Array.isArray(options.types)) {
         subcategoryKeys = subcategoryKeys.filter((e, index) => options.types.indexOf(index) > -1);
      }
      try {
        var goods = await Goods.findGoodsBySubcategoryIds(page, options.length < 1 ? {sort: ["1"]} : options, subcategoryKeys, currentCategory);
      } catch(err) {
        return res.json({message: "Error while searching goods"}); // @TODO server error page
      }

      let subcats = currentCategory.subcategories;
      const subcatsGoodsCount = await Goods.getTotalCountGoodsBySubcategoryId(subcats.map(e => e._id));
      var goodsCount, brands, discountsCount;

      await Promise.all([ // Parallel execution of queries
        async function() {
          discountsCount = await Goods.getAggregatedDiscountsCount(subcategoryKeys);
        }(),
        async function() {
          brands = await Goods.getAllBrandsBySubcategoryIds(subcategoryKeys);
        }(),
        async function() {
          goodsCount = await Goods.getCountOfGoodsBySubcategoryIds(subcategoryKeys);
        }()
      ]);
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
      data.discountsCount = discountsCount;
      data.page = page + 1;
      data.sort = serviceCategory.getOptionsProperty(options, "sort");

      // Check data on correct values
      if (!data || !(data instanceof Object) || Object.keys(data).length < 1 || data.goods.length < 1) {
         return res.render('main/404');
      }
      res.render('category/allGoods', {data});
   }));

   app.use('/category/:categoryName', router);
};

// http://localhost:5001/category/mens/page/1/options/sort:[2],discnt:[1,3],types:[1],brnds:[1,2]

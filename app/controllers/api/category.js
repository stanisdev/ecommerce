'use strict';

/**
 * Routes
 */
module.exports = function (app, express, mongoose, wrap, config) {

  var router = express.Router();

  /**
   * Get list of goods as "json"
   */
  router.post('/getGoods', wrap(async function(req, res) {
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
        const category = await mongoose.model('Category').findAllSubcategoriesByCategoryId(params.categoryId);
        subcats.push(...category.subcategories.map(e => e._id));
     }
     var Goods = mongoose.model('Goods');

     // Get goods by subcategories and filters
     const options = {sort: params.sort, discounts: params.discounts, brands: params.brands};
     const goods = await Goods.findGoodsBySubcategoryIds(params.page - 1, options, subcats, null, true);
     //const goodsCount = await Goods.countGoodsByCriterion(options, subcats);
     res.json(goods);
  }));

  app.use('/api/category', router);
};

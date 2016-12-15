'use strict';

module.exports = function (app, express, mongoose, wrap, config) {

   /**
   * Item of goods
   */
   app.get(/^\/category\/([a-zA-Z\d_]+)\/goods\/([abcdef\d]{24})$/, wrap(async function(req, res) {
      const [category, goodsId] = [req.params[0], req.params[1]];
      const data = await mongoose.model('Goods').findOneGoodsById(goodsId, mongoose);

      if (!data) {
         return res.render('main/404');
      }
      res.json(data);
   }));
};

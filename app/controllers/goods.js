'use strict';

module.exports = (app, co, mongoose) => {

   const url = /^\/category\/([a-zA-Z\d_]+)\/goods\/([abcdef\d]{24})$/;

   /**
    * Item of goods
    */
   app.get(url, co(function* (req, res) {

      const [category, goodsId] = [req.params[0], req.params[1]];
      const data = yield mongoose.Goods.findOneGoodsById(goodsId, mongoose);

      if (!data) {
         return res.render('main/404');
      }
      res.json(data);
   }));
};

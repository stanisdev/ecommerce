const ecommerce = angular.module('ecommerceApp', []);

/**
 * Goods controller constructor
 */
ecommerce.controller('GoodsCtrl', function GoodsController($timeout) {
   const goodsData = JSON.parse(angular.element(_goodsData).val());

   this.goodsData = goodsData;
   console.log( goodsData );
});

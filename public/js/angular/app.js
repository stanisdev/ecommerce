const ecommerce = angular.module('ecommerceApp', []);

/**
 * Goods controller constructor
 */
ecommerce.controller('GoodsCtrl', function GoodsController($timeout) {
   const data = JSON.parse(angular.element(_goodsData).val());
   console.log( data );

   this.data = data;
});

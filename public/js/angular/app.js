const ecommerce = angular.module('ecommerceApp', []);

/**
 * Goods controller constructor
 */
ecommerce.controller('GoodsCtrl', function GoodsController($timeout) {
   const data = JSON.parse(angular.element(_goodsData).val());

   this.data = data;
   console.log( data );
});

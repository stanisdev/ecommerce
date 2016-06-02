const ecommerce = angular.module('ecommerceApp', []);

/**
 * Goods controller constructor
 */
ecommerce.controller('GoodsCtrl', function GoodsController($http, helper) {
   const data = JSON.parse(angular.element(_goodsData).val());
   this.data = data;
   this.categoryId = data.category._id;
   this.sort = '1';
   this.discounts = Array(5).fill(false);

   if (data.goodsTotalCount > 3) {
      helper.pagination(this);
   }

   /**
    * Pagination prev page click
    */
   this.prevPage = () => {
   };

   /**
    * Pagination next page
    */
   this.nextPage = () => {
      const data = helper.getDataObject(this);

      $http
         .post('/api/category/getPage', data)
         .then((data) => {
            console.log(data);
         })
         .catch((err) => {});
   };

   console.log( data );
});

/**
 * Split functionality
 */
ecommerce.factory('helper', function() {
   return {
      pagination(scope) {
         const goodsCount = scope.data.goodsTotalCount;

         scope.curPage = 1;
         scope.maxPage = Math.ceil(goodsCount / 3);
         scope.prevPageBtn = 'disabled';
         scope.nextPageBtn = '';
      },
      getDataObject(scope) {
         const discounts = this.prepareFilterArray(scope.discounts);

         return {
            categoryId: scope.categoryId,
            page: scope.page,
            sort: [scope.sort || 1],
            discounts: scope.discounts || [],
            types: scope.types || [],
            brands: scope.brands || [],
         };
      },
      prepareFilterArray(array) {
         return array.reduce((prev, curr, index) => {
            return (curr ? (prev.push(index + 1), prev): prev);
         }, []);
      }
   };
});

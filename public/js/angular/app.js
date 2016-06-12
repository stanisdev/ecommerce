const ecommerce = angular.module('ecommerceApp', []);

/**
 * Goods controller constructor
 */
ecommerce.controller('GoodsCtrl', function GoodsController(helper, ajax) {
   const data = JSON.parse(angular.element(_goodsData).val());
   this.data = data;
   this.categoryId = data.category._id;
   this.sort = '1';
   this.discounts = Array(5).fill(false);
   this.types = Array( data.subcategories.length ).fill(false);
   this.brands = Array( data.brands.length ).fill(false);

   if (data.goodsTotalCount > 3) {
      helper.paginationPrepare(this);
   }

   /**
    * Pagination prev page click
    */
   this.prevPage = () => {
      this.curPage--;
      ajax.getPage(this);
   };

   /**
    * Pagination next page
    */
   this.nextPage = () => {
      this.curPage++;
      ajax.getPage(this);
   };
   console.log( data );
});

/**
 * Split functionality
 */
ecommerce.factory('helper', function() {
   return {
      paginationPrepare(scope) {
         const goodsCount = scope.data.goodsTotalCount;

         scope.curPage = 1;
         scope.maxPage = Math.ceil(goodsCount / 3);
         this.changeDisabledButton(true, scope);
      },
      paginationSlide(scope) {

         // Do some action while clicking next/prev buttons
         if (scope.curPage == scope.maxPage) {
            this.changeDisabledButton(false, scope);
         } else if (scope.curPage == 1) {
            this.changeDisabledButton(true, scope);
         }
      },
      getDataObject(scope) {
         const {discounts, types, brands} = this.prepareFilterArray(scope);

         // Prepare and return data-object for Ajax query
         return {
            categoryId: scope.categoryId,
            page: scope.curPage,
            sort: [scope.sort || 1],
            discounts: discounts,
            types: types,
            brands: brands,
         };
      },
      prepareFilterArray(scope) {
         // Prepare discounts array
         const discounts = scope.discounts.reduce((prev, curr, index) => {
            return (curr ? (prev.push(index + 1), prev): prev);
         }, []);

         // And types array (i.e. subcategories)
         const types = scope.types.reduce((prev, curr, index) => {
            return (curr ? (prev.push( scope.data.subcategories[index]._id ), prev): prev);
         }, []);

         // Brands array
         const brands = scope.brands.reduce((prev, curr, index) => {
            return (curr ? (prev.push( scope.data.brands[index]._id ), prev): prev);
         }, []);
         return {discounts, types, brands};
      },
      changeDisabledButton(condition, scope) {
         scope.prevPageBtn = (condition ? 'disabled' : '');
         scope.nextPageBtn = (condition ? '' : 'disabled');
      }
   };
});

/**
 * Ajax queries
 */
ecommerce.factory('ajax', function($http, helper) {
   return {
      getPage(scope) {
         helper.paginationSlide(scope);
         const data = helper.getDataObject(scope);

         $http
            .post('/api/category/getGoods', data)
            .then((response) => {
               scope.data.goods = response.data;
            })
            .catch((err) => {});
      }
   };
});

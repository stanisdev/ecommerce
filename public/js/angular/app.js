const ecommerce = angular.module('ecommerceApp', []);

/**
 * Goods controller constructor
 */
ecommerce.controller('GoodsCtrl', function GoodsController(helper, ajax) {
   const data = JSON.parse(angular.element(_goodsData).val()); // http://jsonformatter.org/3eb1fe
   this.data = data;
   this.categoryId = data.category._id;
   this.sort = '1';
   this._discounts = Array(5).fill(false);
   this.types = Array( data.subcategories.length ).fill(false);
   this.brands = Array( data.brands.length ).fill(false);
   this.curPage = data.page;

   {// closure
      var hidden = Array(5).fill(false);
      for (var i = 0; i < 5; i++) {
         (i => {
            Object.defineProperty(this, "discounts_v" + i, {
               set: function(value) {
                  this._discounts[i] = value;
                  hidden[i] = value;
                  ajax.getPage(this);
               },
               get: function() {
                  return hidden[i];
               }
            });
         })(i);
      }
   }
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

   /**
    * Get subcategory title by id
    */
   this.getSubcategoryTitleById = (subcategoryId) => {
      var subcategory = this.data.subcategories.filter(s => s._id == subcategoryId);
      if (subcategory.length < 1) return;
      return subcategory[0] instanceof Object && "title" in subcategory[0] ? subcategory[0].title : "";
   };

   /**
    * Get discounts count by type
    */
   this.getDiscountsCountByType = (type) => {
      var foundDiscount = this.data.discountsCount.filter(d => d.type == +type);
      return foundDiscount.length > 0 && foundDiscount[0] instanceof Object && !isNaN(foundDiscount[0].count) ? foundDiscount[0].count : 0;
   };
});

/**
 * Split functionality
 */
ecommerce.factory('helper', function() {
   return {
      paginationPrepare(scope) {
         const goodsCount = scope.data.goodsTotalCount;

         scope.maxPage = Math.ceil(goodsCount / 3);
         this.paginationSlide(scope);
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
         // Prepare discounts array
         const discounts = scope._discounts.reduce((prev, curr, index) => {
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

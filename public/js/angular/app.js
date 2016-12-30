const ecommerce = angular.module('ecommerceApp', []);

/**
 * Goods controller constructor
 */
ecommerce.controller('GoodsCtrl', function GoodsController(helper, ajax) {
   const data = JSON.parse(angular.element(_goodsData).val()); // http://jsonformatter.org/3eb1fe
   this.data = data;
   this.categoryId = data.category._id;
   this.curPage = data.page;
   this.discounts = [];
   this.types = [];
   this.brands = [];

   var sort = +data.sort;
   this.sort = Number.isInteger(sort) && sort < 7 && sort > 0 ? sort.toString() : "1";
   var self = this;

   var entities = [5, data.subcategories.length, data.brands.length];
   var elements = ["discounts", "types", "brands"];
   {
      var hidden = [];
      entities.forEach((entity, index) => {
         hidden[index] = Array(entities[index]).fill(false); // Fill hidden by default values
         for (let i = 0; i < entities[index]; i++) {
            (i => {
               Object.defineProperty(this[elements[index]], i, {
                  set(value) {
                     hidden[index][i] = value;
                     self.loadData();
                  },
                  get() {
                     return hidden[index][i];
                  }
               });
            })(i);
         }
      });
   }

   if (data.goodsTotalCount > 3) {
      helper.paginationPrepare(this);
   }

   this.loadData = () => {
      this.curPage = 1;
      ajax.getPage(this);
   };

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
            .then(response => {
               scope.data.goods = response.data.goods;
               scope.data.goodsTotalCount = response.data.count;
               if (response.data.count < 4) {
                  scope.curPage = 1;
               }
            })
            .catch(err => {});
      }
   };
});

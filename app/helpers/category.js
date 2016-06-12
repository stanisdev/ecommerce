'use strict';

/**
 * Define filters and behavior
 */
const filters = {

   /**
    * Sorting result
    */
   sort() {
      let sortParam;
      if (this.option.length !== 1 || (sortParam = this.option[0]) > 6 || sortParam < 1 ) {
         return;
      }

      const types = ['title', 'price', 'createdAt'];
      const field = types[ Math.ceil(sortParam / 2) - 1 ];
      const order = sortParam % 2 ? 1 : -1;
      const criterion = {};
      Object.defineProperty(criterion, field, {value: order, enumerable: true});
      this.query.sort(criterion);
   },

   /**
    * Filter by discounts
    */
   discounts() {
      const _ = require('lodash');
      const discounts = _.uniq(this.option);
      const allowed = [1,2,3,4,5];

      if (discounts.length > 5 || discounts.length < 1 || _.intersection(allowed, discounts).length != discounts.length) {
         return;
      }
      const or = { $or: [] };
      const conditions = [
         { discount: { $lte: 10 } },
         [40, 50],
         [20, 30],
         [10, 20],
         { discount: { $gte: 50 } }
      ];
      discounts.forEach(item => {
         let cond = conditions[item - 1];
         cond =
            Object.getPrototypeOf(cond) === Array.prototype
            ? { $and: [
               { discount: { $gte: cond[0] } },
               { discount: { $lte: cond[1] } }
            ]}
            : cond
         or.$or.push(cond);
      });
      this.query.where(or);
   },
   /**
    * Brands filter
    */
   brands() {
      const brands = this.option;
      if (brands.length < 1) {
         return;
      }
      this.query.where({brands: {$in: brands}});
   }
};

/**
 * Disassemle url "options" parameter
 */
module.exports.disassemleUrlOptions = (options) => {
   if (typeof options !== 'string') {
      return [];
   }
   options = options.substr(8).match(/([a-z]+):\[((?:\d,?)+)\]/g);

   const result = options.reduce((accum, item) => {
      let splitted = item.split(':');
      let params = splitted[1].slice(1, -1).split(',').map(e => +e);
      return (accum[splitted[0]] = params, accum);
   }, {});
   return result;
};

/**
 * Get object for mongoose query where-clause
 */
module.exports.setOptionsParam = (query, options) => {

   for (let option in options) {
      if (!filters.hasOwnProperty(option)) {
         throw new Error(`There is no "${option}" filter`);
      }
      filters[option].call( {option: options[option], query: query} );
   }
};

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
         throw new Error('Sort parameter have to has value between 1 and 6');
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
      const allowed = '12345'.split('');
      if (discounts.length > 5 || !discounts.every(e => ~allowed.indexOf(e.toString())) ) {
         throw new Error('Discounts filter has intolerable value');
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
         throw new Error('There is no such filter');
      }
      filters[option].call( {option: options[option], query: query} );
   }
};

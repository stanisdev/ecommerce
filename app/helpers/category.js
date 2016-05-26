
/**
 * Disassemle url "options" parameter
 */
module.exports.disassemleUrlOptions = (_, options) => {
   if (!_.isString(options)) {
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

   if (options.hasOwnProperty('sort')) {
      query.sort();
   }
};

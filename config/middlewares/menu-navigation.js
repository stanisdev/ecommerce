'use strict';

module.exports = (app, co, mongoose) => {

   // Menu navigation
   app.use(co(function* (req, res, next) {

      var mr = {
         map: function() {
            if (this.enabled)
               emit({url: this.url, title: this.title}, {subcategory: this.subcategory});
         },
         finalize: function (key, redValue) {
            var subcats = redValue.subcategory
               .map(function(e) {
                  return {url: e.url, title: e.title, enabled: e.enabled};
               })
               .filter(function(e) {
                  return e.enabled;
               });
            return {url: key.url, title: key.title, subcategory: subcats};
         },
         reduce: function () {}
      };
      mongoose.Category.mapReduce(mr, function (err, result) {
        app.locals.categories = result.map(e => e.value);
        next();
     });
   }));
};

'use strict';

module.exports = (app, co, mongoose) => {

   // Index page
   app.get('/', co(function* (req, res) {
     const Category = yield mongoose.Category;
     const men = new Category({
        title: 'Men'
     });
     yield men.save();
     res.send('Index');
   }));


};

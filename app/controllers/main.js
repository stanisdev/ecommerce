'use strict';

module.exports = (app, co, mongoose) => {

   // Index page
   app.get('/', co(function* (req, res) {
     res.render('main/index');
   }));

   // Fill DB with initial data
   app.get('/create_initial_data', co(function* (req, res) {
      const Category = yield mongoose.Category;
      const men = new Category({
         title: 'Mens',
         url: 'mens',
         subcategory: [
            {title: 'Jackets', url: 'jackets'},
            {title: 'Pants', url: 'pants'},
            {title: 'Shirts', url: 'shirts'},
            {title: 'Sweatshirts', url: 'sweatshirts'}
         ]
      });

      const women = new Category({
         title: 'Womens',
         url: 'womens',
         subcategory: [
            {title: 'Jeans', url: 'jeans'},
            {title: 'Shoes', url: 'shoes'},
            {title: 'Shorts', url: 'shorts'}
         ]
      })
      yield men.save();
      yield women.save();
      res.send('Done');
   }));
};

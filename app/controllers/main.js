'use strict';

module.exports = (app, co, mongoose) => {

   /**
    * Index page
    */
   app.get('/', co(function* (req, res) {
     res.render('main/index');
   }));

   /**
    * Fill DB with initial data
    */
   app.get('/create_initial_data', co(function* (req, res) {
      const Category = mongoose.Category;
      const men = new Category({
         title: 'Mens',
         url: 'mens',
         subcategory: [
            {
               title: 'Jackets',
               url: 'jackets',
               goods: [
                  {
                     title: 'Contrast jacket',
                     price: 199.00,
                     brands: ['Adidas', 'Dior'],
                     description: 'Mixing classic with quirky, the boohooMAN jacket collection is sure to shake up your wardrobe.',
                     tags: ['jacket', 'mixed', 'classic']
                  }
               ]
            },
            {
               title: 'Pants',
               url: 'pants',
               goods: [
                  {
                     title: 'Cream white pants',
                     price: 79.00,
                     brands: ['Amiro'],
                     description: 'Look to joggers in soft touch jersey fabrics and slouchy drop crotch styles as your loungewear staples – teamed with a hoodie, they’re your dressed down dream team.',
                     tags: ['cream']
                  }
               ]
            }
            // {title: 'Shirts', url: 'shirts'},
            // {title: 'Sweatshirts', url: 'sweatshirts'}
         ]
      });
      yield men.save();

      const women = new Category({
         title: 'Womens',
         url: 'womens',
         subcategory: [
            {
               title: 'Jeans',
               url: 'jeans',
               goods: [
                  {
                     title: 'Flower print jeans',
                     price: 99.00,
                     brands: ['Denim'],
                     description: 'Skinny, straight, or slim, find your perfect jeans fit in the boohoo denim collection.',
                     tags: ['jeans']
                  }
               ]
            },
            // {title: 'Shoes', url: 'shoes'},
            // {title: 'Shorts', url: 'shorts'}
         ]
      });
      yield women.save();
      res.send('Done');
   }));
};

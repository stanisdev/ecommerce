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

      // Men category
      const Category = mongoose.Category;
      const men = new Category({
         title: 'Mens',
         url: 'mens',
         subcategory: [
            {
               title: 'Jackets',
               url: 'jackets'
            },
            {
               title: 'Pants',
               url: 'pants'
            }
         ]
      });
      yield men.save();


      // Goods Jackets
      const Goods = mongoose.Goods;
      const menJacket = new Goods({
         title: 'Contrast jacket',
         price: 199.00,
         brands: ['Adidas', 'Dior'],
         description: 'Mixing classic with quirky, the boohooMAN jacket collection is sure to shake up your wardrobe.',
         tags: ['jacket', 'mixed', 'classic'],
         _category: men
      });
      yield menJacket.save();


      // Pants 1
      const menPants1 = new Goods({
         title: 'Cream white pants',
         price: 79.00,
         brands: ['Amiro'],
         description: 'Look to joggers in soft touch jersey fabrics and slouchy drop crotch styles as your loungewear staples – teamed with a hoodie, they’re your dressed down dream team.',
         tags: ['cream'],
         _category: men
      });
      yield menPants1.save();


      // Pants 2
      const menPants2 = new Goods({
         title: 'Powder pants',
         price: 47.00,
         brand: ['Gucci'],
         description: 'Mix and match your must- haves for a cool yet casual combo.',
         tags: [],
         _category: men
      });
      yield menPants2.save();


      // Pants 3
      const menPants3 = new Goods({
         title: 'Skinny Fit Tweed Trousers',
         price: 35.00,
         brand: [],
         description: 'Make trousers the talking point of your outfit. Slim fits continue to be a style staple, while timeless tweed and classic cords make a comeback.',
         tags: ['trousers'],
         _category: men
      });
      yield menPants3.save();


      // Pants 4
      const menPants4 = new Goods({
         title: 'Regular Fit Jogger',
         price: 16.00,
         brand: ['Vely'],
         description: 'Look to joggers in soft touch jersey fabrics and slouchy drop crotch styles as your loungewear staples.',
         tags: [],
         _category: men
      });
      yield menPants4.save();


      // Pants 5
      const menPants5 = new Goods({
         title: 'Drop Crotch PU Panel Joggers',
         price: 26.00,
         brand: [],
         description: 'For a more fashion-forward fix, we’ve edged up your essentials with PU trims',
         tags: [],
         _category: men
      });
      yield menPants5.save();


      // Save jackets in subcategory
      men.subcategory[0].goods.push(menJacket);
      // Save pants in subcategory
      men.subcategory[1].goods.push(menPants1, menPants2, menPants3, menPants4, menPants5);
      yield men.save();


      // Women Categoty
      const women = new Category({
         title: 'Womens',
         url: 'womens',
         subcategory: [
            {
               title: 'Jeans',
               url: 'jeans'
            }
         ]
      });
      yield women.save();


      // Goods Jeans
      const womenJeans = new Goods({
         title: 'Flower print jeans',
         price: 99.00,
         brands: ['Denim'],
         description: 'Skinny, straight, or slim, find your perfect jeans fit in the boohoo denim collection.',
         tags: ['jeans'],
         _category: women
      });
      yield womenJeans.save();


      // Save jeans in subcategory
      women.subcategory[0].goods.push(womenJeans);
      yield women.save();


      console.log('Saved');
      res.send('All queries have been done');
   }));
};

module.exports = (mongoose, wrap) => {

  wrap(async function() {
    console.log('IMPORTING BEGAN');

    // Schema
    const Category = mongoose.model('Category');
    const Subcategory = mongoose.model('Subcategory');
    const Goods = mongoose.model('Goods');

    /**
    * Men Categoty
    */
    const men = new Category({ title: 'Mens', url: 'mens' });
    await men.save();

    // Mens subcategories
    const jackets = new Subcategory({ title: 'Jackets', url: 'jackets', _category: men });
    const pants = new Subcategory({ title: 'Pants', url: 'pants', _category: men });
    await jackets.save();
    await pants.save();

    // Add subcategories to category men
    men.subcategories.push(jackets, pants);
    await men.save();

    // Goods Jackets
    const menJacket = new Goods({
       _id: '57482da02c38d9d241e16c25',
       title: 'Contrast jacket',
       price: 199.00,
       brands: ['Adidas', 'Dior'],
       description: 'Mixing classic with quirky, the boohooMAN jacket collection is sure to shake up your wardrobe.',
       tags: ['jacket', 'mixed', 'classic'],
       _subcategory: jackets
    });
    await menJacket.save();

    // Pants 1
    const menPants1 = new Goods({
       _id: '57482da02c38d9d241e16c26',
       title: 'Cream white pants',
       price: 79.00,
       brands: ['Amiro'],
       description: 'Look to joggers in soft touch jersey fabrics and slouchy drop crotch styles as your loungewear staples – teamed with a hoodie, they’re your dressed down dream team.',
       tags: ['cream'],
       _subcategory: pants
    });
    await menPants1.save();

    // Pants 2
    const menPants2 = new Goods({
       _id: '57482da02c38d9d241e16c27',
       title: 'Powder pants',
       price: 47.00,
       brand: ['Gucci'],
       description: 'Mix and match your must- haves for a cool yet casual combo.',
       tags: [],
       _subcategory: pants
    });
    await menPants2.save();

    // Pants 3
    const menPants3 = new Goods({
       _id: '57482da02c38d9d241e16c28',
       title: 'Skinny Trousers',
       price: 35.00,
       brand: [],
       description: 'Make trousers the talking point of your outfit. Slim fits continue to be a style staple, while timeless tweed and classic cords make a comeback.',
       tags: ['trousers'],
       _subcategory: pants
    });
    await menPants3.save();

    // Pants 4
    const menPants4 = new Goods({
       _id: '57482da02c38d9d241e16c29',
       title: 'Regular Fit Jogger',
       price: 16.00,
       brand: ['Vely'],
       description: 'Look to joggers in soft touch jersey fabrics and slouchy drop crotch styles as your loungewear staples.',
       tags: [],
       _subcategory: pants
    });
    await menPants4.save();

    // Pants 5
    const menPants5 = new Goods({
       _id: '57482da02c38d9d241e16c2a',
       title: 'Drop Crotch PU',
       price: 26.00,
       brand: [],
       description: 'For a more fashion-forward fix, we’ve edged up your essentials with PU trims',
       tags: [],
       _subcategory: pants
    });
    await menPants5.save();

    // Save jackets in subcategory
    jackets.goods.push(menJacket);
    // Save pants in subcategory
    pants.goods.push(menPants1, menPants2, menPants3, menPants4, menPants5);
    await jackets.save();
    await pants.save();

    /**
    * Women Categoty
    */
    const women = new Category({ title: 'Womens', url: 'womens' });
    await women.save();

    // Jeans subcategory
    const jeans = new Subcategory({ title: 'Jeans', url: 'jeans', _category: women });
    await jeans.save();

    // Add womans subcategory jeans
    women.subcategories.push(jeans);
    await women.save();

    // Goods Jeans
    const womenJeans = new Goods({
       _id: '57482da12c38d9d241e16c2d',
       title: 'Flower print jeans',
       price: 99.00,
       brands: ['Denim'],
       description: 'Skinny, straight, or slim, find your perfect jeans fit in the boohoo denim collection.',
       tags: ['jeans'],
       _subcategory: jeans
    });
    await womenJeans.save();

    // Save jeans in subcategory
    jeans.goods.push(womenJeans);
    await jeans.save();

    console.log('SUCCESS');
    process.exit();
  })();
};

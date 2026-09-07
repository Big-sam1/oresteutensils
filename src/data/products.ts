import { Product } from '../types';

export const images = {
  // Hero and promo banners (Kitchen-themed)
  hero:     'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=80',
  promo:     new URL('../components/images/ore.png', import.meta.url).href,

  // 10 Kitchen category images
  cookware:           new URL('../components/images/cookware.jpg', import.meta.url).href,
  kitchenUtensils:    new URL('../components/images/kitchen utensils.png', import.meta.url).href,
  foodPrep:           new URL('../components/images/kitchen ware.jpg', import.meta.url).href,
  dinnerware:         new URL('../components/images/dinnerware.jpg', import.meta.url).href,
  drinkware:          new URL('../components/images/drinkware.jpg', import.meta.url).href,
  kitchenStorage:      new URL('../components/images/foodstorage.jpg', import.meta.url).href,
  kitchenAppliances:  new URL('../components/images/home appriances.jpg', import.meta.url).href,
  baking:              new URL('../components/images/baking.jpg', import.meta.url).href,
  kitchenCleaning:    new URL('../components/images/kitchen cleaning.jpg', import.meta.url).href,
  kitchenAccessories: new URL('../components/images/kitchen accesories.jpg', import.meta.url).href,
};

// Dedicated image paths for the Best Selling Products section.
const bestSellerImages: Record<string, [string, string]> = {
  nonStickFryingPan: [
    new URL('../components/images/cookware.jpg', import.meta.url).href,
    new URL('../components/images/Non-Stick Frying Pan.jpg', import.meta.url).href,
  ],
  siliconeUtensilSet: [
    new URL('../components/images/Silicone Utensil Set2.jpg', import.meta.url).href,
    new URL('../components/images/Silicone Utensil Set1.jpg', import.meta.url).href,
  ],
  professionalKnifeSet: [
    new URL('../components/images/Professional Knife Set1.jpg', import.meta.url).href,
    new URL('../components/images/Professional Knife Set2.jpg', import.meta.url).href,
  ],
  airtightContainerSet: [
    new URL('../components/images/foodstorage.jpg', import.meta.url).href,
    new URL('../components/images/Airtight Container Set2.jpg', import.meta.url).href,
  ],
  highSpeedBlender: [
    new URL('../components/images/blender1.jpg', import.meta.url).href,
    new URL('../components/images/blender2.jpg', import.meta.url).href,
  ],
};

// Dedicated normal and hover image paths for the additional products.
const additionalProductImages: Record<string, [string, string]> = {
  castIronSkillet: [
    new URL('../components/images/cookware.jpg', import.meta.url).href,
    new URL('../components/images/kitchen ware.jpg', import.meta.url).href,
  ],
  stainlessSteelSaucepan: [
    new URL('../components/images/cookware.jpg', import.meta.url).href,
    new URL('../components/images/kitchen utensils.png', import.meta.url).href,
  ],
  bambooUtensilSet: [
    new URL('../components/images/kitchen utensils.png', import.meta.url).href,
    new URL('../components/images/cookware.jpg', import.meta.url).href,
  ],
  stainlessSteelTongs: [
    new URL('../components/images/kitchen utensils.png', import.meta.url).href,
    new URL('../components/images/kitchen ware.jpg', import.meta.url).href,
  ],
  woodenCuttingBoard: [
    new URL('../components/images/kitchen ware.jpg', import.meta.url).href,
    new URL('../components/images/kitchen utensils.png', import.meta.url).href,
  ],
  manualFoodChopper: [
    new URL('../components/images/kitchen ware.jpg', import.meta.url).href,
    new URL('../components/images/home appriances.jpg', import.meta.url).href,
  ],
  stonewareServingBowls: [
    new URL('../components/images/dinnerware.jpg', import.meta.url).href,
    new URL('../components/images/drinkware.jpg', import.meta.url).href,
  ],
  matteCeramicPlates: [
    new URL('../components/images/dinnerware.jpg', import.meta.url).href,
    new URL('../components/images/kitchen accesories.jpg', import.meta.url).href,
  ],
  insulatedTravelTumbler: [
    new URL('../components/images/drinkware.jpg', import.meta.url).href,
    new URL('../components/images/dinnerware.jpg', import.meta.url).href,
  ],
  glassWaterBottle: [
    new URL('../components/images/drinkware.jpg', import.meta.url).href,
    new URL('../components/images/foodstorage.jpg', import.meta.url).href,
  ],
  spiceJarOrganizer: [
    new URL('../components/images/foodstorage.jpg', import.meta.url).href,
    new URL('../components/images/kitchen accesories.jpg', import.meta.url).href,
  ],
  underShelfBasket: [
    new URL('../components/images/foodstorage.jpg', import.meta.url).href,
    new URL('../components/images/kitchen ware.jpg', import.meta.url).href,
  ],
  compactAirFryer: [
    new URL('../components/images/home appriances.jpg', import.meta.url).href,
    new URL('../components/images/cookware.jpg', import.meta.url).href,
  ],
  electricHandMixer: [
    new URL('../components/images/home appriances.jpg', import.meta.url).href,
    new URL('../components/images/baking.jpg', import.meta.url).href,
  ],
  siliconeBakingMatSet: [
    new URL('../components/images/baking.jpg', import.meta.url).href,
    new URL('../components/images/cookware.jpg', import.meta.url).href,
  ],
  digitalKitchenTimer: [
    new URL('../components/images/baking.jpg', import.meta.url).href,
    new URL('../components/images/kitchen accesories.jpg', import.meta.url).href,
  ],
  siliconeDishDryingMat: [
    new URL('../components/images/kitchen cleaning.jpg', import.meta.url).href,
    new URL('../components/images/foodstorage.jpg', import.meta.url).href,
  ],
  reusableCleaningCloths: [
    new URL('../components/images/kitchen cleaning.jpg', import.meta.url).href,
    new URL('../components/images/kitchen accesories.jpg', import.meta.url).href,
  ],
  digitalMeasuringSpoons: [
    new URL('../components/images/kitchen accesories.jpg', import.meta.url).href,
    new URL('../components/images/kitchen ware.jpg', import.meta.url).href,
  ],
  kitchenHerbScissors: [
    new URL('../components/images/kitchen accesories.jpg', import.meta.url).href,
    new URL('../components/images/kitchen utensils.png', import.meta.url).href,
  ],
};

type AdditionalProduct = Omit<Product, 'images'> & {
  imagePaths: [string, string];
};

const createAdditionalProduct = ({ imagePaths, ...product }: AdditionalProduct): Product => ({
  ...product,
  images: imagePaths,
});

const additionalProducts: Product[] = [
  createAdditionalProduct({ id: 'k11', slug: 'cast-iron-skillet', name: 'Cast Iron Skillet', category: 'Cookware', price: 52000, oldPrice: 68000, rating: 4.7, reviews: 142, colors: [{ name: 'Black', hex: '#1b1b1b' }], description: 'Pre-seasoned cast iron skillet with even heat retention for searing, roasting, and stovetop-to-oven cooking.', features: ['Pre-seasoned cooking surface', 'Oven safe to 260°C (500°F)', 'Works on induction and open flame'], inStock: true, imagePaths: additionalProductImages.castIronSkillet }),
  createAdditionalProduct({ id: 'k12', slug: 'stainless-steel-saucepan', name: 'Stainless Steel Saucepan', category: 'Cookware', price: 45000, oldPrice: 58000, rating: 4.6, reviews: 87, colors: [{ name: 'Silver', hex: '#c0c0c0' }], description: 'Heavy-gauge stainless steel saucepan with a tempered glass lid for sauces, grains, and everyday simmering.', features: ['Tri-ply heat distribution', 'Tempered glass lid', 'Dishwasher safe'], inStock: true, imagePaths: additionalProductImages.stainlessSteelSaucepan }),
  createAdditionalProduct({ id: 'k13', slug: 'bamboo-utensil-set', name: 'Bamboo Utensil Set', category: 'Kitchen Utensils', price: 25000, oldPrice: 32000, rating: 4.6, reviews: 116, colors: [{ name: 'Natural', hex: '#c69c6d' }], description: 'Seven-piece bamboo cooking utensil set with smooth handles that protect non-stick cookware.', features: ['Seven everyday utensils', 'Naturally lightweight bamboo', 'Safe for non-stick surfaces'], inStock: true, imagePaths: additionalProductImages.bambooUtensilSet }),
  createAdditionalProduct({ id: 'k14', slug: 'stainless-steel-tongs', name: 'Stainless Steel Kitchen Tongs', category: 'Kitchen Utensils', price: 17000, oldPrice: 22000, rating: 4.5, reviews: 74, colors: [{ name: 'Silver', hex: '#c0c0c0' }], description: 'Lockable stainless steel tongs with silicone tips for turning, serving, and plating hot food.', features: ['Heat-resistant silicone tips', 'Locking ring for storage', 'Comfortable non-slip grip'], inStock: true, imagePaths: additionalProductImages.stainlessSteelTongs }),
  createAdditionalProduct({ id: 'k15', slug: 'wooden-cutting-board', name: 'End-Grain Cutting Board', category: 'Food Preparation', price: 48000, oldPrice: 65000, rating: 4.8, reviews: 129, colors: [{ name: 'Walnut', hex: '#6b4226' }], description: 'Thick end-grain cutting board with a generous prep surface for vegetables, herbs, and meat.', features: ['Knife-friendly end grain', 'Deep juice groove', 'Non-slip corner feet'], inStock: true, imagePaths: additionalProductImages.woodenCuttingBoard }),
  createAdditionalProduct({ id: 'k16', slug: 'manual-food-chopper', name: 'Manual Food Chopper', category: 'Food Preparation', price: 32000, oldPrice: 42000, rating: 4.5, reviews: 91, colors: [{ name: 'Clear', hex: '#e8f4f8' }], description: 'Compact pull-cord food chopper for quick onions, herbs, vegetables, and salsa preparation.', features: ['Sharp stainless steel blades', 'Large 900ml bowl', 'Dishwasher-safe bowl'], inStock: true, imagePaths: additionalProductImages.manualFoodChopper }),
  createAdditionalProduct({ id: 'k17', slug: 'stoneware-serving-bowls', name: 'Stoneware Serving Bowls', category: 'Dinnerware', price: 50000, oldPrice: 65000, rating: 4.7, reviews: 103, colors: [{ name: 'White', hex: '#f5f5f5' }], description: 'Set of four glazed stoneware serving bowls sized for salads, soups, sides, and desserts.', features: ['Set of four bowls', 'Chip-resistant glaze', 'Microwave and dishwasher safe'], inStock: true, imagePaths: additionalProductImages.stonewareServingBowls }),
  createAdditionalProduct({ id: 'k18', slug: 'matte-ceramic-plates', name: 'Matte Ceramic Plate Set', category: 'Dinnerware', price: 70000, oldPrice: 90000, rating: 4.8, reviews: 156, colors: [{ name: 'Sage', hex: '#8faf8f' }], description: 'Modern six-piece matte ceramic plate set designed for everyday meals and special table settings.', features: ['Six dinner plates', 'Scratch-resistant finish', 'Oven safe up to 220°C (428°F)'], inStock: true, imagePaths: additionalProductImages.matteCeramicPlates }),
  createAdditionalProduct({ id: 'k19', slug: 'insulated-travel-tumbler', name: 'Insulated Travel Tumbler', category: 'Drinkware', price: 35000, oldPrice: 45000, rating: 4.7, reviews: 188, colors: [{ name: 'Teal', hex: '#1abc9c' }], description: 'Double-wall travel tumbler with a secure lid that keeps coffee hot and water cold while commuting.', features: ['450ml capacity', 'Double-wall insulation', 'Leak-resistant sliding lid'], inStock: true, imagePaths: additionalProductImages.insulatedTravelTumbler }),
  createAdditionalProduct({ id: 'k20', slug: 'glass-water-bottle', name: 'Borosilicate Glass Water Bottle', category: 'Drinkware', price: 28000, oldPrice: 38000, rating: 4.6, reviews: 94, colors: [{ name: 'Clear', hex: '#e8f4f8' }], description: 'Reusable borosilicate glass bottle with a protective sleeve for clean, everyday hydration.', features: ['600ml capacity', 'BPA-free materials', 'Removable protective sleeve'], inStock: true, imagePaths: additionalProductImages.glassWaterBottle }),
  createAdditionalProduct({ id: 'k21', slug: 'spice-jar-organizer', name: 'Spice Jar Organizer', category: 'Kitchen Storage', price: 40000, oldPrice: 52000, rating: 4.6, reviews: 115, colors: [{ name: 'Clear', hex: '#e8f4f8' }], description: 'Modular spice jar organizer that keeps favorite seasonings visible and neatly arranged.', features: ['Twelve refillable jars', 'Writable labels included', 'Stackable organizer tray'], inStock: true, imagePaths: additionalProductImages.spiceJarOrganizer }),
  createAdditionalProduct({ id: 'k22', slug: 'under-shelf-basket', name: 'Under-Shelf Storage Basket', category: 'Kitchen Storage', price: 24000, oldPrice: 32000, rating: 4.4, reviews: 63, colors: [{ name: 'White', hex: '#f5f5f5' }], description: 'Slide-on wire basket that creates extra pantry or cabinet storage without tools.', features: ['Tool-free installation', 'Ventilated wire design', 'Fits standard shelves'], inStock: true, imagePaths: additionalProductImages.underShelfBasket }),
  createAdditionalProduct({ id: 'k23', slug: 'compact-air-fryer', name: 'Compact Air Fryer', category: 'Kitchen Appliances', price: 98000, oldPrice: 130000, rating: 4.7, reviews: 236, colors: [{ name: 'Black', hex: '#1b1b1b' }], description: 'Compact digital air fryer for crisp vegetables, fries, and snacks with less oil.', features: ['3.5L cooking basket', 'Eight preset programs', 'Removable dishwasher-safe basket'], inStock: true, imagePaths: additionalProductImages.compactAirFryer }),
  createAdditionalProduct({ id: 'k24', slug: 'electric-hand-mixer', name: 'Electric Hand Mixer', category: 'Kitchen Appliances', price: 52000, oldPrice: 68000, rating: 4.5, reviews: 88, colors: [{ name: 'White', hex: '#f5f5f5' }], description: 'Five-speed electric hand mixer for whipped cream, cake batter, dough, and sauces.', features: ['Five speed settings', 'Two beaters and dough hooks', 'Eject button for easy cleaning'], inStock: true, imagePaths: additionalProductImages.electricHandMixer }),
  createAdditionalProduct({ id: 'k25', slug: 'silicone-baking-mat-set', name: 'Silicone Baking Mat Set', category: 'Baking', price: 26000, oldPrice: 36000, rating: 4.8, reviews: 147, colors: [{ name: 'Red', hex: '#c0392b' }], description: 'Reusable non-stick silicone baking mats for cookies, pastries, vegetables, and roasted snacks.', features: ['Set of two mats', 'Oven safe to 230°C (450°F)', 'Replaces disposable parchment'], inStock: true, imagePaths: additionalProductImages.siliconeBakingMatSet }),
  createAdditionalProduct({ id: 'k26', slug: 'digital-kitchen-timer', name: 'Digital Kitchen Timer', category: 'Baking', price: 15000, oldPrice: 20000, rating: 4.4, reviews: 61, colors: [{ name: 'White', hex: '#f5f5f5' }], description: 'Large-display digital timer with a loud alert for baking, cooking, and meal preparation.', features: ['99-minute countdown', 'Magnetic back and stand', 'Easy-to-read display'], inStock: true, imagePaths: additionalProductImages.digitalKitchenTimer }),
  createAdditionalProduct({ id: 'k27', slug: 'silicone-dish-drying-mat', name: 'Silicone Dish Drying Mat', category: 'Kitchen Cleaning', price: 22000, oldPrice: 30000, rating: 4.5, reviews: 79, colors: [{ name: 'Grey', hex: '#7f8c8d' }], description: 'Flexible ribbed drying mat that cushions glassware and drains water directly into the sink.', features: ['Fast-draining ribs', 'Non-slip silicone base', 'Rolls up for storage'], inStock: true, imagePaths: additionalProductImages.siliconeDishDryingMat }),
  createAdditionalProduct({ id: 'k28', slug: 'reusable-cleaning-cloths', name: 'Reusable Cleaning Cloths', category: 'Kitchen Cleaning', price: 19000, oldPrice: 26000, rating: 4.6, reviews: 102, colors: [{ name: 'Green', hex: '#4d8b57' }], description: 'Washable microfiber cloth set for counters, appliances, glass, and everyday kitchen spills.', features: ['Pack of twelve cloths', 'Lint-free microfiber', 'Machine washable'], inStock: true, imagePaths: additionalProductImages.reusableCleaningCloths }),
  createAdditionalProduct({ id: 'k29', slug: 'digital-measuring-spoons', name: 'Digital Measuring Spoons', category: 'Kitchen Accessories', price: 31000, oldPrice: 40000, rating: 4.7, reviews: 126, colors: [{ name: 'Silver', hex: '#c0c0c0' }], description: 'Precision digital measuring spoon set for spices, coffee, baking ingredients, and liquids.', features: ['Tare and unit conversion', 'Measures up to 300g', 'Includes four spoon sizes'], inStock: true, imagePaths: additionalProductImages.digitalMeasuringSpoons }),
  createAdditionalProduct({ id: 'k30', slug: 'kitchen-herb-scissors', name: 'Kitchen Herb Scissors', category: 'Kitchen Accessories', price: 18000, oldPrice: 24000, rating: 4.5, reviews: 68, colors: [{ name: 'Green', hex: '#4d8b57' }], description: 'Five-blade herb scissors for quickly cutting chives, parsley, basil, and fresh garnishes.', features: ['Five sharp stainless blades', 'Cleaning comb included', 'Comfortable ergonomic handles'], inStock: true, imagePaths: additionalProductImages.kitchenHerbScissors }),
];

// Edit only this map to change a product's normal and cursor-hover images.
// The key is the product URL slug, for example /product/airtight-container-set.
export const productImagePaths: Record<string, [string, string]> = {
  'non-stick-frying-pan': bestSellerImages.nonStickFryingPan,
  'silicone-utensil-set': bestSellerImages.siliconeUtensilSet,
  'professional-knife-set': bestSellerImages.professionalKnifeSet,
  'airtight-container-set': bestSellerImages.airtightContainerSet,
  'high-speed-blender': bestSellerImages.highSpeedBlender,
  'ceramic-dinner-set': [images.dinnerware, images.drinkware],
  'double-wall-glass-mugs': [images.drinkware, images.dinnerware],
  'baking-essentials-set': [images.baking, images.cookware],
  'stainless-steel-dish-rack': [images.kitchenCleaning, images.kitchenStorage],
  'digital-kitchen-scale': [images.kitchenAccessories, images.foodPrep],
  'cast-iron-skillet': additionalProductImages.castIronSkillet,
  'stainless-steel-saucepan': additionalProductImages.stainlessSteelSaucepan,
  'bamboo-utensil-set': additionalProductImages.bambooUtensilSet,
  'stainless-steel-tongs': additionalProductImages.stainlessSteelTongs,
  'wooden-cutting-board': additionalProductImages.woodenCuttingBoard,
  'manual-food-chopper': additionalProductImages.manualFoodChopper,
  'stoneware-serving-bowls': additionalProductImages.stonewareServingBowls,
  'matte-ceramic-plates': additionalProductImages.matteCeramicPlates,
  'insulated-travel-tumbler': additionalProductImages.insulatedTravelTumbler,
  'glass-water-bottle': additionalProductImages.glassWaterBottle,
  'spice-jar-organizer': additionalProductImages.spiceJarOrganizer,
  'under-shelf-basket': additionalProductImages.underShelfBasket,
  'compact-air-fryer': additionalProductImages.compactAirFryer,
  'electric-hand-mixer': additionalProductImages.electricHandMixer,
  'silicone-baking-mat-set': additionalProductImages.siliconeBakingMatSet,
  'digital-kitchen-timer': additionalProductImages.digitalKitchenTimer,
  'silicone-dish-drying-mat': additionalProductImages.siliconeDishDryingMat,
  'reusable-cleaning-cloths': additionalProductImages.reusableCleaningCloths,
  'digital-measuring-spoons': additionalProductImages.digitalMeasuringSpoons,
  'kitchen-herb-scissors': additionalProductImages.kitchenHerbScissors,
};

const catalogProducts: Product[] = [
  // 1. 🍳 Cookware
  {
    id: 'k1',
    slug: 'non-stick-frying-pan',
    name: 'Non-Stick Frying Pan',
    category: 'Cookware',
    price: 47000,
    oldPrice: 65000,
    rating: 4.8,
    reviews: 211,
    images: bestSellerImages.nonStickFryingPan,
    colors: [
      { name: 'Graphite', hex: '#4a4a4a' },
      { name: 'Red', hex: '#c0392b' },
    ],
    description: 'Premium 28cm non-stick frying pan crafted with heavy-gauge aluminum for fast and even heat distribution. Suitable for all stovetops including induction.',
    features: [
      'PFOA-free triple-layer non-stick coating',
      'Induction-compatible stainless steel base',
      'Oven safe up to 200°C (400°F)',
      'Ergonomic cool-touch handle',
      'Dishwasher safe',
    ],
    inStock: true,
    bestSeller: true,
    deal: true,
  },

  // 2. 🔪 Kitchen Utensils
  {
    id: 'k2',
    slug: 'silicone-utensil-set',
    name: 'Silicone Utensil Set',
    category: 'Kitchen Utensils',
    price: 30000,
    oldPrice: 45000,
    rating: 4.7,
    reviews: 178,
    images: bestSellerImages.siliconeUtensilSet,
    colors: [
      { name: 'Teal', hex: '#1abc9c' },
      { name: 'Black', hex: '#1b1b1b' },
      { name: 'Grey', hex: '#7f8c8d' },
    ],
    description: 'Comprehensive 8-piece heat-resistant silicone utensil set with natural acacia wood handles. Includes spatula, deep soup ladle, slotted turner, tongs, and whisk.',
    features: [
      'Heat resistant up to 230°C (450°F)',
      '100% Food-grade BPA-free silicone',
      'Protects non-stick cookware from scratches',
      'Natural moisture-resistant acacia handles',
    ],
    inStock: true,
    bestSeller: true,
  },

  // 3. 🥣 Food Preparation
  {
    id: 'k3',
    slug: 'professional-knife-set',
    name: 'Professional Knife Set',
    category: 'Food Preparation',
    price: 85000,
    oldPrice: 120000,
    rating: 4.9,
    reviews: 304,
    images: bestSellerImages.professionalKnifeSet,
    colors: [
      { name: 'Silver', hex: '#c0c0c0' },
      { name: 'Black', hex: '#1b1b1b' },
    ],
    description: 'High-carbon German stainless steel 5-piece knife block set. Precision forged for superior edge retention, optimal balance, and effortless cutting.',
    features: [
      'High-carbon German 1.4116 stainless steel',
      'Hand-sharpened 15° razor-sharp edge',
      'Full-tang triple-riveted ergonomic handle',
      'Includes solid bamboo countertop block',
    ],
    inStock: true,
    bestSeller: true,
    deal: true,
  },

  // 4. 🍽️ Dinnerware
  {
    id: 'k4',
    slug: 'ceramic-dinner-set',
    name: 'Ceramic Dinner Set (16 pcs)',
    category: 'Dinnerware',
    price: 65000,
    oldPrice: 90000,
    rating: 4.6,
    reviews: 136,
    images: [images.dinnerware, images.drinkware, images.kitchenAccessories],
    colors: [
      { name: 'White', hex: '#f5f5f5' },
      { name: 'Sage', hex: '#8faf8f' },
      { name: 'Beige', hex: '#e2d5c3' },
    ],
    description: 'Service for 4 modern minimalist stoneware dinner set. Includes 4 dinner plates, 4 salad plates, 4 cereal bowls, and 4 coffee mugs.',
    features: [
      'Crafted from durable high-fire stoneware',
      'Chip-resistant with scratch-resistant matte glaze',
      'Microwave, oven, and dishwasher safe',
      'Stackable nesting design saves cupboard space',
    ],
    inStock: true,
  },

  // 5. ☕ Drinkware
  {
    id: 'k5',
    slug: 'double-wall-glass-mugs',
    name: 'Double-Wall Glass Mugs (Set of 4)',
    category: 'Drinkware',
    price: 32000,
    oldPrice: 42000,
    rating: 4.8,
    reviews: 189,
    images: [images.drinkware, images.dinnerware, images.kitchenStorage],
    colors: [
      { name: 'Clear', hex: '#e8f4f8' },
    ],
    description: 'Insulated double-wall borosilicate glass cups (350ml / 12oz). Keeps hot beverages steaming and iced drinks chilled without exterior condensation.',
    features: [
      'Thermal-shock resistant borosilicate glass',
      'Double-wall vacuum insulation',
      'Safe for microwave, freezer, and dishwasher',
      'Comfortable ergonomic curved handle',
    ],
    inStock: true,
    deal: true,
  },

  // 6. 🧂 Kitchen Storage
  {
    id: 'k6',
    slug: 'airtight-container-set',
    name: 'Airtight Container Set',
    category: 'Kitchen Storage',
    price: 42000,
    oldPrice: 58000,
    rating: 4.7,
    reviews: 245,
    images: bestSellerImages.airtightContainerSet,
    colors: [
      { name: 'Clear', hex: '#e8f4f8' },
      { name: 'Sage', hex: '#8faf8f' },
      { name: 'Black', hex: '#1b1b1b' },
    ],
    description: 'Set of 10 modular airtight pantry storage containers with 4-side locking silicone sealed lids. Keeps flour, sugar, cereal, and snacks fresh for longer.',
    features: [
      '100% BPA-free crystal-clear shatterproof plastic',
      'Silicone seal with 4-point snap lock mechanism',
      'Stackable space-saving design',
      'Includes reusable chalk labels and liquid chalk pen',
    ],
    inStock: true,
    bestSeller: true,
  },

  // 7. ⚡ Kitchen Appliances
  {
    id: 'k7',
    slug: 'high-speed-blender',
    name: 'High-Speed Blender',
    category: 'Kitchen Appliances',
    price: 120000,
    oldPrice: 165000,
    rating: 4.9,
    reviews: 412,
    images: bestSellerImages.highSpeedBlender,
    colors: [
      { name: 'Black', hex: '#1b1b1b' },
      { name: 'Silver', hex: '#c0c0c0' },
      { name: 'Red', hex: '#c0392b' },
    ],
    description: '1400W commercial-grade countertop blender with 6 aircraft-grade stainless steel blades. Effortlessly crushes ice, blends smoothies, purées soups, and grinds nuts.',
    features: [
      '1400-Watt high-torque precision motor',
      '2.0L (68 oz) BPA-free Tritan pitcher',
      'Variable 8-speed control + pulse button',
      '60-second self-cleaning cycle',
    ],
    inStock: true,
    bestSeller: true,
    deal: true,
  },

  // 8. 🧁 Baking
  {
    id: 'k8',
    slug: 'baking-essentials-set',
    name: 'Baking Essentials Set',
    category: 'Baking',
    price: 48000,
    oldPrice: 68000,
    rating: 4.6,
    reviews: 163,
    images: [images.baking, images.cookware, images.kitchenStorage],
    colors: [
      { name: 'Cream', hex: '#f5f0e8' },
      { name: 'Rose', hex: '#e8a0a0' },
      { name: 'Graphite', hex: '#4a4a4a' },
    ],
    description: 'Complete 12-piece carbon steel non-stick bakeware collection. Includes baking sheets, muffin pan, round cake pans, loaf pan, silicone pastry brush, and cooling rack.',
    features: [
      'Heavyweight carbon steel resists warping',
      'Superior non-stick release coating',
      'Oven-safe up to 230°C (450°F)',
      'Reinforced rolled edges for easy handling',
    ],
    inStock: true,
  },

  // 9. 🧼 Kitchen Cleaning
  {
    id: 'k9',
    slug: 'stainless-steel-dish-rack',
    name: 'Stainless Steel Dish Rack',
    category: 'Kitchen Cleaning',
    price: 35000,
    oldPrice: 48000,
    rating: 4.5,
    reviews: 98,
    images: [images.kitchenCleaning, images.kitchenStorage, images.kitchenAccessories],
    colors: [
      { name: 'Silver', hex: '#c0c0c0' },
      { name: 'Black', hex: '#1b1b1b' },
    ],
    description: '2-tier rust-proof stainless steel dish drying rack with an automatic drainage spout, removable cutlery holder, and specialized cup drying attachments.',
    features: [
      '304 Rust-proof food-grade stainless steel',
      '360° Swivel drainage spout leads water straight to sink',
      'Holds up to 18 plates, 6 bowls, and 4 wine glasses',
      'Anti-slip silicone rubber feet protect counters',
    ],
    inStock: true,
  },

  // 10. 🪑 Kitchen Accessories
  {
    id: 'k10',
    slug: 'digital-kitchen-scale',
    name: 'Digital Kitchen Scale',
    category: 'Kitchen Accessories',
    price: 25000,
    oldPrice: 38000,
    rating: 4.8,
    reviews: 327,
    images: [images.kitchenAccessories, images.foodPrep, images.baking],
    colors: [
      { name: 'Silver', hex: '#c0c0c0' },
      { name: 'Black', hex: '#1b1b1b' },
      { name: 'White', hex: '#f5f5f5' },
    ],
    description: 'Slim digital food scale with 4 high-precision strain gauge sensors. Accurate measurements from 1g up to 5000g with a crisp backlit LCD screen.',
    features: [
      'High-precision 1g / 0.05oz graduation',
      'Instant one-touch Tare / Zero function',
      'Unit conversion: g, oz, lb:oz, ml, fl:oz',
      'Easy-to-clean tempered glass & stainless steel surface',
    ],
    inStock: true,
    bestSeller: true,
  },
  ...additionalProducts,
];

export const products: Product[] = catalogProducts.map((product) => ({
  ...product,
  images: productImagePaths[product.slug] ?? product.images,
}));

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function relatedProducts(product: Product): Product[] {
  const same = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );
  const others = products.filter(
    (p) => p.category !== product.category && p.id !== product.id
  );
  return [...same, ...others].slice(0, 8);
}
import { Category } from '../types';
import { images, products } from './products';

const categoryCount = (name: string) => products.filter((product) => product.category === name).length;

export const categories: Category[] = [
  { id: 'cookware',             name: 'Cookware',             count: categoryCount('Cookware'),             image: images.cookware,           tint: '#fff3e0' },
  { id: 'kitchen-utensils',     name: 'Kitchen Utensils',     count: categoryCount('Kitchen Utensils'),     image: images.kitchenUtensils,    tint: '#e8f5e9' },
  { id: 'food-preparation',     name: 'Food Preparation',     count: categoryCount('Food Preparation'),     image: images.foodPrep,           tint: '#fce4ec' },
  { id: 'dinnerware',           name: 'Dinnerware',           count: categoryCount('Dinnerware'),           image: images.dinnerware,         tint: '#e3f2fd' },
  { id: 'drinkware',            name: 'Drinkware',            count: categoryCount('Drinkware'),            image: images.drinkware,          tint: '#e0f7fa' },
  { id: 'kitchen-storage',      name: 'Kitchen Storage',      count: categoryCount('Kitchen Storage'),      image: images.kitchenStorage,     tint: '#f3e5f5' },
  { id: 'kitchen-appliances',   name: 'Kitchen Appliances',   count: categoryCount('Kitchen Appliances'),   image: images.kitchenAppliances,  tint: '#ede7f6' },
  { id: 'baking',               name: 'Baking',               count: categoryCount('Baking'),               image: images.baking,             tint: '#fff8e1' },
  { id: 'kitchen-cleaning',     name: 'Kitchen Cleaning',     count: categoryCount('Kitchen Cleaning'),     image: images.kitchenCleaning,    tint: '#e8eaf6' },
  { id: 'kitchen-accessories',  name: 'Kitchen Accessories',  count: categoryCount('Kitchen Accessories'),  image: images.kitchenAccessories, tint: '#e0f2f1' },
];

/** Category names that map to real product categories in the catalog. */
export const shopCategories = [
  'Cookware',
  'Kitchen Utensils',
  'Food Preparation',
  'Dinnerware',
  'Drinkware',
  'Kitchen Storage',
  'Kitchen Appliances',
  'Baking',
  'Kitchen Cleaning',
  'Kitchen Accessories',
];
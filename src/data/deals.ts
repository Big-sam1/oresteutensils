import { Deal } from '../types';
import { images } from './products';

export const deals: Deal[] = [
  {
    id: 'd1',
    eyebrow: 'Special Offer',
    title: 'Up to 50% Off Cookware',
    copy: 'Limited time promotion on premium non-stick cookware and chef essentials. Upgrade your kitchen today!',
    cta: 'Shop Cookware Sale',
    href: '/shop?category=Cookware',
    image: images.cookware,
    tint: '#fff3e0'
  },
  {
    id: 'd2',
    eyebrow: 'Chef Recommended',
    title: 'Precision Kitchen Cutlery',
    copy: 'High-carbon German steel knives crafted for flawless slicing, chopping, and prep work.',
    cta: 'Explore Knives',
    href: '/shop?category=Food%20Preparation',
    image: images.foodPrep,
    tint: '#fce4ec'
  },
  {
    id: 'd3',
    eyebrow: 'Countertop Upgrade',
    title: 'High-Speed Culinary Blenders',
    copy: '1400W commercial-grade blending power for soups, smoothies, nut butters, and sauces.',
    cta: 'Shop Appliances',
    href: '/shop?category=Kitchen%20Appliances',
    image: images.kitchenAppliances,
    tint: '#ede7f6'
  }
];
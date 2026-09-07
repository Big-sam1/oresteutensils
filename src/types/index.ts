export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  images: string[];
  colors: {name: string;hex: string;}[];
  description: string;
  features: string[];
  inStock: boolean;
  badge?: string;
  bestSeller?: boolean;
  deal?: boolean;
}

export interface Category {
  id: string;
  name: string;
  count: number;
  image: string;
  tint: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar: string;
}

export interface Deal {
  id: string;
  eyebrow: string;
  title: string;
  copy: string;
  cta: string;
  href: string;
  image: string;
  tint: string;
}

export interface CartLine {
  productId: string;
  quantity: number;
  color: string;
}

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}
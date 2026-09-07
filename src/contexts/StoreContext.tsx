import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState } from
'react';
import { CartLine, Product, Toast, ToastVariant } from '../types';
import { products as fallbackProducts } from '../data/products';
import { useAdminDatabase } from './AdminDatabaseContext';

interface FlyPayload {
  id: number;
  src: string;
  from: {top: number;left: number;width: number;height: number;};
}

interface StoreValue {
  products: Product[];
  cart: CartLine[];
  cartCount: number;
  cartBumpKey: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon: string | null;
  wishlist: string[];
  theme: 'light' | 'dark';
  toasts: Toast[];
  fly: FlyPayload | null;
  addToCart: (
  product: Product,
  quantity?: number,
  color?: string,
  origin?: HTMLElement | null)
  => void;
  setQuantity: (productId: string, color: string, quantity: number) => void;
  removeLine: (productId: string, color: string) => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (id: string) => boolean;
  applyCoupon: (code: string) => boolean;
  clearCoupon: () => void;
  toggleTheme: () => void;
  pushToast: (message: string, variant?: ToastVariant) => void;
  dismissToast: (id: number) => void;
  clearFly: () => void;
  lineProduct: (productId: string) => Product | undefined;
}

const StoreContext = createContext<StoreValue | null>(null);

const VALID_COUPONS: Record<string, number> = { SAVE10: 0.1, SHOPMATE: 0.15 };

export function StoreProvider({ children }: {children: React.ReactNode;}) {
  const adminDb = useAdminDatabase();
  const products = adminDb?.products?.length ? adminDb.products : fallbackProducts;

  const [cart, setCart] = useState<CartLine[]>([
  { productId: 'k1', quantity: 1, color: 'Graphite' }]
  );
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [cartBumpKey, setCartBumpKey] = useState(0);
  const [fly, setFly] = useState<FlyPayload | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage.getItem('shopmate-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ?
    'dark' :
    'light';
  });

  const toastId = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    root.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('shopmate-theme', theme);
    const timer = window.setTimeout(
      () => root.classList.remove('theme-transition'),
      340
    );
    return () => window.clearTimeout(timer);
  }, [theme]);

  const pushToast = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = ++toastId.current;
      setToasts((prev) => [...prev.slice(-2), { id, message, variant }]);
      window.setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        3600
      );
    },
    []
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToCart = useCallback(
    (
    product: Product,
    quantity = 1,
    color?: string,
    origin?: HTMLElement | null) =>
    {
      const chosen = color ?? product.colors[0]?.name ?? 'Default';
      setCart((prev) => {
        const existing = prev.find(
          (l) => l.productId === product.id && l.color === chosen
        );
        if (existing) {
          return prev.map((l) =>
          l === existing ? { ...l, quantity: l.quantity + quantity } : l
          );
        }
        return [...prev, { productId: product.id, quantity, color: chosen }];
      });
      setCartBumpKey((k) => k + 1);
      if (origin) {
        const rect = origin.getBoundingClientRect();
        setFly({
          id: Date.now(),
          src: product.images[0],
          from: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          }
        });
      }
      pushToast(`${product.name} added to cart`);
    },
    [pushToast]
  );

  const setQuantity = useCallback(
    (productId: string, color: string, quantity: number) => {
      setCart((prev) =>
      prev.map((l) =>
      l.productId === productId && l.color === color ?
      { ...l, quantity: Math.max(1, Math.min(99, quantity)) } :
      l
      )
      );
      setCartBumpKey((k) => k + 1);
    },
    []
  );

  const removeLine = useCallback(
    (productId: string, color: string) => {
      setCart((prev) =>
      prev.filter((l) => !(l.productId === productId && l.color === color))
      );
      setCartBumpKey((k) => k + 1);
      pushToast('Item removed from cart', 'info');
    },
    [pushToast]
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      setWishlist((prev) => {
        const has = prev.includes(product.id);
        pushToast(
          has ? 'Removed from Wishlist' : 'Added to Wishlist',
          has ? 'info' : 'success'
        );
        return has ? prev.filter((id) => id !== product.id) : [...prev, product.id];
      });
    },
    [pushToast]
  );

  const isWishlisted = useCallback(
    (id: string) => wishlist.includes(id),
    [wishlist]
  );

  const applyCoupon = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase();
      if (VALID_COUPONS[normalized]) {
        setCoupon(normalized);
        pushToast(`Coupon ${normalized} applied`);
        return true;
      }
      pushToast('That coupon code is not valid', 'error');
      return false;
    },
    [pushToast]
  );

  const clearCoupon = useCallback(() => setCoupon(null), []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      pushToast(next === 'dark' ? 'Dark mode on' : 'Light mode on', 'info');
      return next;
    });
  }, [pushToast]);

  const clearFly = useCallback(() => setFly(null), []);

  const lineProduct = useCallback(
    (productId: string) => products.find((p) => p.id === productId),
    [products]
  );

  const { cartCount, subtotal } = useMemo(() => {
    let count = 0;
    let sum = 0;
    cart.forEach((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) return;
      count += line.quantity;
      sum += product.price * line.quantity;
    });
    return { cartCount: count, subtotal: sum };
  }, [cart, products]);

  const discount = coupon ? subtotal * VALID_COUPONS[coupon] : 0;
  const shipping = subtotal > 50000 || subtotal === 0 ? 0 : 5000;
  const total = Math.max(0, subtotal - discount + shipping);

  const value: StoreValue = {
    products,
    cart,
    cartCount,
    cartBumpKey,
    subtotal,
    discount,
    shipping,
    total,
    coupon,
    wishlist,
    theme,
    toasts,
    fly,
    addToCart,
    setQuantity,
    removeLine,
    toggleWishlist,
    isWishlisted,
    applyCoupon,
    clearCoupon,
    toggleTheme,
    pushToast,
    dismissToast,
    clearFly,
    lineProduct
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
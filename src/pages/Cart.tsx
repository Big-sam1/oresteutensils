import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRightIcon,
  CheckIcon,
  Loader2Icon,
  ShoppingCartIcon,
  XIcon } from
'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { QuantitySelector } from '../components/product/QuantitySelector';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { ServiceBenefits } from '../components/layout/ServiceBenefits';
import { Reveal } from '../components/ui/Reveal';
import { useStore } from '../contexts/StoreContext';
import { currency } from '../utils/format';

export function Cart() {
  const {
    cart,
    lineProduct,
    setQuantity,
    removeLine,
    subtotal,
    discount,
    shipping,
    total,
    coupon,
    applyCoupon
  } = useStore();

  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<'idle' | 'applying' | 'done'>('idle');
  const [shake, setShake] = useState(0);

  const submitCoupon = () => {
    if (phase !== 'idle' || !code.trim()) return;
    setPhase('applying');
    window.setTimeout(() => {
      const ok = applyCoupon(code);
      if (ok) {
        setPhase('done');
        window.setTimeout(() => setPhase('idle'), 1800);
      } else {
        setPhase('idle');
        setShake((s) => s + 1);
      }
    }, 600);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-white">
        Shopping Cart
      </h1>

      {cart.length === 0 ?
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-300 py-20 text-center dark:border-ink-700">
        
          <motion.span
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-100 text-brand-600 dark:bg-ink-800">
          
            <ShoppingCartIcon className="h-6 w-6" />
          </motion.span>
          <h2 className="text-lg font-bold text-ink-900 dark:text-white">
            Your cart is empty
          </h2>
          <p className="max-w-xs text-sm text-ink-500 dark:text-ink-400">
            Browse the shop and add something you love — we'll keep it here.
          </p>
          <Link
          to="/shop"
          className="group mt-2 inline-flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600">
          
            Continue Shopping
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
          </Link>
        </motion.div> :

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div>
            <div className="overflow-hidden rounded-xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
              <div className="hidden grid-cols-[2.2fr_1fr_1.2fr_1fr_auto] gap-3 border-b border-ink-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-400 sm:grid dark:border-ink-800">
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Subtotal</span>
                <span className="w-6" />
              </div>

              <AnimatePresence initial={false}>
                {cart.map((line) => {
                const product = lineProduct(line.productId);
                if (!product) return null;
                return (
                  <motion.div
                    key={`${line.productId}-${line.color}`}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="grid grid-cols-1 items-center gap-3 border-b border-ink-100 px-4 py-4 last:border-b-0 sm:grid-cols-[2.2fr_1fr_1.2fr_1fr_auto] dark:border-ink-800">
                    
                      <div className="flex items-center gap-3">
                        <Link
                        to={`/product/${product.slug}`}
                        className="group overflow-hidden rounded-lg bg-cream-50 dark:bg-ink-800">
                        
                          <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-14 w-14 object-cover transition-transform duration-500 ease-premium group-hover:scale-110" />
                        
                        </Link>
                        <span>
                          <Link
                          to={`/product/${product.slug}`}
                          className="block text-sm font-semibold text-ink-900 transition-colors duration-200 hover:text-brand-600 dark:text-white">
                          
                            {product.name}
                          </Link>
                          <span className="text-xs text-ink-400">
                            {line.color}
                          </span>
                        </span>
                      </div>

                      <span className="text-sm text-ink-600 dark:text-ink-300">
                        {currency(product.price)}
                      </span>

                      <QuantitySelector
                      size="sm"
                      value={line.quantity}
                      onChange={(q) =>
                      setQuantity(line.productId, line.color, q)
                      } />
                    

                      <span className="text-sm font-bold text-ink-900 dark:text-white">
                        <AnimatedNumber value={product.price * line.quantity} />
                      </span>

                      <motion.button
                      type="button"
                      onClick={() => removeLine(line.productId, line.color)}
                      aria-label={`Remove ${product.name}`}
                      whileHover={{ scale: 1.15, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                      className="justify-self-start rounded-md p-1 text-ink-400 transition-colors duration-200 hover:text-red-500 sm:justify-self-end">
                      
                        <XIcon className="h-4 w-4" />
                      </motion.button>
                    </motion.div>);

              })}
              </AnimatePresence>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <motion.div
              key={shake}
              animate={shake ? { x: [0, -6, 6, -4, 4, 0] } : undefined}
              transition={{ duration: 0.34, ease: 'easeOut' }}
              className="flex flex-1 gap-2">
              
                <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Coupon Code"
                aria-label="Coupon code"
                className="min-w-0 flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors duration-200 focus:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
              
                <motion.button
                type="button"
                onClick={submitCoupon}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.16 }}
                className="flex h-11 min-w-[9.5rem] items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600">
                
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                    key={phase}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-1.5">
                    
                      {phase === 'applying' ?
                    <>
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                          Applying...
                        </> :
                    phase === 'done' ?
                    <>
                          <CheckIcon className="h-4 w-4" strokeWidth={3} />
                          Coupon Applied
                        </> :

                    'Apply Coupon'
                    }
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </motion.div>
              <Link
              to="/shop"
              className="inline-flex h-11 items-center rounded-lg border border-ink-300 px-4 text-sm font-semibold text-ink-800 transition-colors duration-200 hover:border-brand-400 hover:text-brand-700 dark:border-ink-700 dark:text-ink-100">
              
                Continue Shopping
              </Link>
            </div>
          </div>

          <Reveal direction="left">
            <div className="rounded-xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
              <h2 className="text-base font-bold text-ink-900 dark:text-white">
                Cart Totals
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <Row label="Subtotal">
                  <AnimatedNumber value={subtotal} />
                </Row>
                <AnimatePresence>
                  {discount > 0 &&
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
                  className="overflow-hidden">
                  
                      <Row label={`Discount (${coupon})`} accent>
                        −<AnimatedNumber value={discount} />
                      </Row>
                    </motion.div>
                }
                </AnimatePresence>
                <Row label="Shipping">
                  {shipping === 0 ?
                <span className="text-brand-600 dark:text-brand-300">
                      Free Shipping
                    </span> :

                <AnimatedNumber value={shipping} />
                }
                </Row>
                <div className="border-t border-ink-200 pt-3 dark:border-ink-800">
                  <Row label="Total" strong>
                    <AnimatedNumber value={total} />
                  </Row>
                </div>
              </dl>

              <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="mt-5">
              
                <Link
                to="/checkout"
                className="group flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600">
                
                  Proceed to Checkout
                  <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
                </Link>
              </motion.div>

              <p className="mt-3 text-center text-xs text-ink-400">
                Guaranteed safe & secure checkout
              </p>
            </div>
          </Reveal>
        </div>
      }

      <div className="mt-12">
        <ServiceBenefits />
      </div>
    </div>);

}

function Row({
  label,
  children,
  strong = false,
  accent = false





}: {label: string;children: React.ReactNode;strong?: boolean;accent?: boolean;}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt
        className={
        strong ?
        'font-bold text-ink-900 dark:text-white' :
        'text-ink-500 dark:text-ink-400'
        }>
        
        {label}
      </dt>
      <dd
        className={
        strong ?
        'text-base font-bold text-ink-900 dark:text-white' :
        accent ?
        'font-semibold text-brand-600 dark:text-brand-300' :
        'font-medium text-ink-800 dark:text-ink-100'
        }>
        
        {children}
      </dd>
    </div>);

}
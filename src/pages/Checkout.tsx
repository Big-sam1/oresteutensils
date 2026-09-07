import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  Loader2Icon,
  PackageCheckIcon } from
'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Field } from '../components/ui/Field';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { Reveal } from '../components/ui/Reveal';
import { useStore } from '../contexts/StoreContext';
import { currency } from '../utils/format';

const steps = ['Information', 'Shipping', 'Payment', 'Confirmation'] as const;

export function Checkout() {
  const { cart, lineProduct, subtotal, discount, shipping, total, coupon, pushToast } =
  useStore();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    zip: '',
    card: '',
    expiry: '',
    cvc: ''
  });
  const [shippingMethod, setShippingMethod] = useState('standard');

  const set = (key: keyof typeof form) => (value: string) =>
  setForm((f) => ({ ...f, [key]: value }));

  const go = (delta: 1 | -1) => {
    setDirection(delta);
    setStep((s) => Math.max(0, Math.min(steps.length - 1, s + delta)));
  };

  const placeOrder = () => {
    setPlacing(true);
    window.setTimeout(() => {
      setPlacing(false);
      setDirection(1);
      setStep(3);
      pushToast('Order placed — confirmation sent by email');
    }, 900);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">
      <Breadcrumbs
        items={[
        { label: 'Home', to: '/' },
        { label: 'Cart', to: '/cart' },
        { label: 'Checkout' }]
        } />
      
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-white">
        Checkout
      </h1>

      <ol className="mt-6 flex items-center gap-2" aria-label="Checkout progress">
        {steps.map((label, i) =>
        <li key={label} className="flex flex-1 items-center gap-2">
            <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${
            i <= step ?
            'bg-brand-500 text-white' :
            'bg-ink-100 text-ink-400 dark:bg-ink-800'}`
            }>
            
              {i < step ? <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span
            className={`hidden text-xs font-semibold sm:block ${
            i <= step ?
            'text-ink-900 dark:text-white' :
            'text-ink-400'}`
            }>
            
              {label}
            </span>
            {i < steps.length - 1 &&
          <span className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                <motion.span
              className="absolute inset-y-0 left-0 bg-brand-500"
              initial={false}
              animate={{ width: i < step ? '100%' : '0%' }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} />
            
              </span>
          }
          </li>
        )}
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.34, ease: [0.23, 1, 0.32, 1] }}>
              
              {step === 0 &&
              <div className="space-y-5">
                  <h2 className="text-base font-bold text-ink-900 dark:text-white">
                    Contact information
                  </h2>
                  <Field
                  label="Email address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={set('email')}
                  validate={(v) =>
                  /.+@.+\..+/.test(v) ? null : 'Enter a valid email address'
                  } />
                
                  <Field
                  label="Full name"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={set('name')} />
                
                  <Field
                  label="Street address"
                  name="address"
                  autoComplete="street-address"
                  value={form.address}
                  onChange={set('address')} />
                
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={set('city')} />
                  
                    <Field
                    label="ZIP code"
                    name="zip"
                    value={form.zip}
                    onChange={set('zip')}
                    validate={(v) =>
                    v.length >= 4 ? null : 'ZIP looks too short'
                    } />
                  
                  </div>
                </div>
              }

              {step === 1 &&
              <div className="space-y-4">
                  <h2 className="text-base font-bold text-ink-900 dark:text-white">
                    Shipping method
                  </h2>
                  {[
                { id: 'standard', label: 'Standard (3–5 days)', price: 'Free' },
                { id: 'express', label: 'Express (1–2 days)', price: '5,000 FRW' },
                { id: 'pickup', label: 'Collect in store', price: 'Free' }].
                map((option) =>
                <motion.label
                  key={option.id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors duration-200 ${
                  shippingMethod === option.id ?
                  'border-brand-500 bg-brand-50/60 dark:bg-ink-800' :
                  'border-ink-200 dark:border-ink-700'}`
                  }>
                  
                      <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === option.id}
                    onChange={() => setShippingMethod(option.id)}
                    className="h-4 w-4 accent-brand-500" />
                  
                      <span className="flex-1 text-sm font-medium text-ink-800 dark:text-ink-100">
                        {option.label}
                      </span>
                      <span className="text-sm font-semibold text-ink-900 dark:text-white">
                        {option.price}
                      </span>
                    </motion.label>
                )}
                </div>
              }

              {step === 2 &&
              <div className="space-y-5">
                  <h2 className="text-base font-bold text-ink-900 dark:text-white">
                    Payment details
                  </h2>
                  <Field
                  label="Card number"
                  name="card"
                  autoComplete="cc-number"
                  value={form.card}
                  onChange={set('card')}
                  validate={(v) =>
                  v.replace(/\s/g, '').length >= 15 ?
                  null :
                  'Card number looks incomplete'
                  } />
                
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                    label="Expiry (MM/YY)"
                    name="expiry"
                    value={form.expiry}
                    onChange={set('expiry')}
                    validate={(v) =>
                    /^\d{2}\/\d{2}$/.test(v) ? null : 'Use MM/YY'
                    } />
                  
                    <Field
                    label="CVC"
                    name="cvc"
                    value={form.cvc}
                    onChange={set('cvc')}
                    validate={(v) => v.length >= 3 ? null : 'CVC is 3 digits'} />
                  
                  </div>
                </div>
              }

              {step === 3 &&
              <div className="flex flex-col items-center py-8 text-center">
                  <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white">
                  
                    <PackageCheckIcon className="h-7 w-7" />
                  </motion.span>
                  <h2 className="mt-4 text-lg font-bold text-ink-900 dark:text-white">
                    Order confirmed
                  </h2>
                  <p className="mt-2 max-w-sm text-sm text-ink-500 dark:text-ink-400">
                    Thanks{form.name ? `, ${form.name.split(' ')[0]}` : ''} — your
                    order is on its way. A receipt is heading to your inbox.
                  </p>
                  <Link
                  to="/shop"
                  className="group mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600">
                  
                    Keep Shopping
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
                  </Link>
                </div>
              }
            </motion.div>
          </AnimatePresence>

          {step < 3 &&
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
              <button
              type="button"
              onClick={() => go(-1)}
              disabled={step === 0}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 transition-colors duration-200 hover:text-brand-600 disabled:opacity-40 dark:text-ink-300">
              
                <ArrowLeftIcon className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:-translate-x-1" />
                Back
              </button>
              <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.16 }}
              onClick={() => step === 2 ? placeOrder() : go(1)}
              className="group inline-flex h-11 min-w-[10rem] items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600">
              
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                  key={placing ? 'placing' : step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-2">
                  
                    {placing ?
                  <>
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                        Placing order...
                      </> :
                  step === 2 ?
                  'Place Order' :

                  <>
                        Continue
                        <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
                      </>
                  }
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          }
        </div>

        <Reveal direction="left">
          <div className="rounded-xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
            <h2 className="text-base font-bold text-ink-900 dark:text-white">
              Order Summary
            </h2>
            <ul className="mt-4 space-y-3">
              {cart.map((line) => {
                const product = lineProduct(line.productId);
                if (!product) return null;
                return (
                  <li
                    key={`${line.productId}-${line.color}`}
                    className="flex items-center gap-3">
                    
                    <img
                      src={product.images[0]}
                      alt=""
                      aria-hidden="true"
                      className="h-12 w-12 rounded-lg bg-cream-50 object-cover dark:bg-ink-800" />
                    
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink-900 dark:text-white">
                        {product.name}
                      </span>
                      <span className="text-xs text-ink-400">
                        {line.color} · Qty {line.quantity}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-ink-900 dark:text-white">
                      {currency(product.price * line.quantity)}
                    </span>
                  </li>);

              })}
            </ul>

            <dl className="mt-5 space-y-2.5 border-t border-ink-200 pt-4 text-sm dark:border-ink-800">
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">Subtotal</dt>
                <dd className="font-medium text-ink-800 dark:text-ink-100">
                  <AnimatedNumber value={subtotal} />
                </dd>
              </div>
              {discount > 0 &&
              <div className="flex justify-between">
                  <dt className="text-ink-500 dark:text-ink-400">
                    Discount ({coupon})
                  </dt>
                  <dd className="font-semibold text-brand-600 dark:text-brand-300">
                    −<AnimatedNumber value={discount} />
                  </dd>
                </div>
              }
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">Shipping</dt>
                <dd className="font-medium text-ink-800 dark:text-ink-100">
                  {shipping === 0 ? 'Free' : <AnimatedNumber value={shipping} />}
                </dd>
              </div>
              <div className="flex justify-between border-t border-ink-200 pt-3 dark:border-ink-800">
                <dt className="font-bold text-ink-900 dark:text-white">Total</dt>
                <dd className="text-base font-bold text-ink-900 dark:text-white">
                  <AnimatedNumber value={total} />
                </dd>
              </div>
            </dl>
          </div>
        </Reveal>
      </div>
    </div>);

}
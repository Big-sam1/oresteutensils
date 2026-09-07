import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useStore } from '../../contexts/StoreContext';

/**
 * Renders the product thumbnail arcing from the card toward the header cart
 * icon. Purely transform/opacity based so it never triggers layout.
 */
export function FlyToCart() {
  const { fly, clearFly } = useStore();
  const reduce = useReducedMotion();
  const [target, setTarget] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!fly) return;
    const anchor = document.getElementById('cart-anchor');
    if (!anchor) {
      clearFly();
      return;
    }
    const rect = anchor.getBoundingClientRect();
    setTarget({
      x: rect.left + rect.width / 2 - (fly.from.left + fly.from.width / 2),
      y: rect.top + rect.height / 2 - (fly.from.top + fly.from.height / 2)
    });
  }, [fly, clearFly]);

  if (reduce) return null;

  return (
    <AnimatePresence>
      {fly &&
      <motion.img
        key={fly.id}
        src={fly.src}
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed z-[85] rounded-lg object-cover shadow-lift"
        style={{
          top: fly.from.top,
          left: fly.from.left,
          width: fly.from.width,
          height: fly.from.height
        }}
        initial={{ opacity: 0.95, scale: 1 }}
        animate={{
          x: target.x,
          y: target.y,
          scale: 0.16,
          opacity: 0.2
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.62, ease: [0.4, 0, 0.2, 1] }}
        onAnimationComplete={clearFly} />

      }
    </AnimatePresence>);

}
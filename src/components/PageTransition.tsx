import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type TransitionKind = 'fade' | 'slide-left' | 'slide-up' | 'scale';

const variants: Record<
  TransitionKind,
  {initial: Record<string, number>;exit: Record<string, number>;}> =
{
  fade: { initial: { opacity: 0, y: 12 }, exit: { opacity: 0, y: -8 } },
  'slide-left': { initial: { opacity: 0, x: 40 }, exit: { opacity: 0, x: -28 } },
  'slide-up': { initial: { opacity: 0, y: 34 }, exit: { opacity: 0, y: -20 } },
  scale: { initial: { opacity: 0, scale: 0.97 }, exit: { opacity: 0, scale: 0.98 } }
};

/** Per-route entrance/exit so navigation never snaps. */
export function PageTransition({
  children,
  kind = 'fade'
}: {children: React.ReactNode;kind?: TransitionKind;}) {
  const reduce = useReducedMotion();
  const v = variants[kind];

  if (reduce) {
    return <main className="w-full">{children}</main>;
  }

  return (
    <motion.main
      initial={v.initial}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
      className="w-full">
      {children}
    </motion.main>);
}
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  distance?: number;
  scale?: boolean;
  as?: 'div' | 'section' | 'li' | 'header' | 'article';
  amount?: number;
}

const offsets: Record<Direction, {x: number;y: number;}> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
  none: { x: 0, y: 0 }
};

export function Reveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  distance = 22,
  scale = false,
  as = 'div',
  amount = 0.2
}: RevealProps) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as React.ElementType;
  const dir = offsets[direction];

  if (reduce) {
    return <Comp className={className}>{children}</Comp>;
  }

  return (
    <Comp
      className={className}
      initial={{
        opacity: 0,
        x: dir.x * distance,
        y: dir.y * distance,
        scale: scale ? 0.96 : 1
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.23, 1, 0.32, 1]
      }}>
      
      {children}
    </Comp>);

}

/** Container that staggers its Reveal-less children on view. */
export function StaggerGrid({
  children,
  className,
  step = 0.08




}: {children: React.ReactNode;className?: string;step?: number;}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduce ? 0 : step } }
      }}>
      
      {children}
    </motion.div>);

}

export const staggerItem = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const }
  }
};
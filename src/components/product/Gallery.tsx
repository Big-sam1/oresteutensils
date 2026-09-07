import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MaximizeIcon } from
'lucide-react';
import { Modal } from '../ui/Modal';

export function Gallery({
  images,
  name



}: {images: string[];name: string;}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [full, setFull] = useState(false);

  const step = (delta: 1 | -1) =>
  setIndex((i) => (i + delta + images.length) % images.length);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin({
      x: (e.clientX - rect.left) / rect.width * 100,
      y: (e.clientY - rect.top) / rect.height * 100
    });
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 w-full min-w-0 max-w-full">
      <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 shrink-0">
        {images.map((src, i) =>
        <button
          key={src + i}
          type="button"
          onClick={() => setIndex(i)}
          aria-label={`View image ${i + 1}`}
          aria-current={i === index}
          className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-50 transition-all duration-200 dark:bg-ink-800 ${
            i === index
              ? 'ring-2 ring-brand-500 shadow-sm scale-105 opacity-100'
              : 'opacity-70 hover:opacity-100 hover:scale-102'
          }`}>
          
            <img
            src={src}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover transition-transform duration-300 ease-premium hover:scale-105" />
          </button>
        )}
      </div>

      <div className="relative min-w-0 flex-1 w-full">
        <div
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={onMove}
          className="relative aspect-square w-full overflow-hidden rounded-xl bg-cream-50 dark:bg-ink-800">
          
          <motion.img
            key={images[index] + index}
            src={images[index]}
            alt={name}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1, scale: zoom && !reduce ? 1.6 : 1 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
            className="absolute inset-0 h-full w-full object-cover" />

          <button
            type="button"
            onClick={() => setFull(true)}
            aria-label="Open fullscreen viewer"
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-sm transition-transform duration-200 ease-premium hover:scale-110 dark:bg-ink-900/90 dark:text-ink-100">
            
            <MaximizeIcon className="h-4 w-4" />
          </button>
        </div>

        {images.length > 1 &&
        <>
            <ArrowBtn side="left" onClick={() => step(-1)} />
            <ArrowBtn side="right" onClick={() => step(1)} />
          </>
        }
      </div>

      <Modal
        open={full}
        onClose={() => setFull(false)}
        label={`${name} image viewer`}
        size="full"
        bare>
        
        <div className="relative">
          <motion.img
            key={index}
            src={images[index]}
            alt={name}
            initial={{ opacity: 0.6, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="mx-auto max-h-[80vh] w-auto rounded-xl object-contain" />
          <ArrowBtn side="left" onClick={() => step(-1)} light />
          <ArrowBtn side="right" onClick={() => step(1)} light />
        </div>
      </Modal>
    </div>);

}

function ArrowBtn({
  side,
  onClick,
  light = false




}: {side: 'left' | 'right';onClick: () => void;light?: boolean;}) {
  const Icon = side === 'left' ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous image' : 'Next image'}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
      className={`absolute top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full shadow-sm transition-colors duration-200 ${
      light ?
      'bg-white/90 text-ink-800' :
      'bg-white/90 text-ink-700 dark:bg-ink-900/90 dark:text-ink-100'} ${
      side === 'left' ? 'left-3' : 'right-3'}`}>
      
      <Icon className="h-4 w-4" />
    </motion.button>);

}
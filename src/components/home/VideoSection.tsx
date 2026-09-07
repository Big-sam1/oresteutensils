import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon } from 'lucide-react';
import { images } from '../../data/products';
import { Modal } from '../ui/Modal';
import { Reveal } from '../ui/Reveal';

export function VideoSection() {
  const [open, setOpen] = useState(false);

  return (
    <Reveal>
      <div className="grid items-center gap-6 rounded-2xl border border-ink-200 bg-white p-5 sm:grid-cols-[1.2fr_1fr] sm:p-6 dark:border-ink-800 dark:bg-ink-900">
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Play the ShopMate story film"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          className="group relative overflow-hidden rounded-xl">
          
          <img
            src={images.hero}
            alt=""
            aria-hidden="true"
            className="aspect-video w-full object-cover transition-transform duration-500 ease-premium group-hover:scale-[1.04]" />
          
          <span className="absolute inset-0 bg-ink-950/25 transition-colors duration-300 group-hover:bg-ink-950/15" />
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <motion.span
              animate={{ scale: [1, 1.35], opacity: [0.45, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full bg-white" />
            
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-600 transition-transform duration-300 ease-premium group-hover:scale-110">
              <PlayIcon className="ml-0.5 h-5 w-5 fill-current" />
            </span>
          </span>
        </motion.button>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
            Inside ShopMate
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
            How we pick every product
          </h2>
          <p className="mt-3 text-sm leading-6 text-ink-600 dark:text-ink-300">
            Every item is tested by our team before it reaches the shelf — from
            sound quality to stitching. Watch the two-minute film on how our
            buyers work.
          </p>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        label="ShopMate story film"
        size="full">
        
        <div className="aspect-video w-full bg-ink-950">
          <video
            src="https://cdn.coverr.co/videos/coverr-typing-on-a-laptop-1573/1080p.mp4"
            poster={images.hero}
            controls
            autoPlay
            playsInline
            className="h-full w-full" />
          
        </div>
      </Modal>
    </Reveal>);

}
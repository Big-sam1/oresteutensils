import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, HelpCircleIcon } from 'lucide-react';
import { Reveal } from '../ui/Reveal';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Materials & Safety',
    question: 'Are Oresteutensils products 100% food-grade and non-toxic?',
    answer:
      'Yes, absolutely. All of our cookware, cutlery, and utensils are crafted with non-toxic, PFOA-free, lead-free, and FDA-approved food-grade materials including German high-carbon stainless steel, virgin platinum silicone, and high-fire natural stoneware.',
  },
  {
    category: 'Care & Maintenance',
    question: 'How do I care for non-stick cookware and chef knives?',
    answer:
      'For non-stick cookware, hand washing with warm soapy water and soft sponges is recommended to prolong coating life. For our German stainless-steel knives, hand wash and towel dry immediately after use, storing them in the bamboo block to retain their 15° razor edge.',
  },
  {
    category: 'Compatibility',
    question: 'Can I use Oresteutensils cookware on induction stoves and in the oven?',
    answer:
      'Yes! Our cookware features heavy-gauge induction-compatible stainless-steel base plates and is oven safe up to 200°C (400°F). Our baking collections are oven safe up to 230°C (450°F).',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((curr) => (curr === index ? null : index));
  };

  return (
    <section className="py-12 lg:py-16" aria-labelledby="faq-heading">
      <Reveal className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
          <HelpCircleIcon className="h-3.5 w-3.5" />
          Got Questions?
        </span>
        <h2
          id="faq-heading"
          className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl dark:text-white"
        >
          Frequently Asked Questions
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-ink-600 dark:text-ink-300">
          Everything you need to know about Oresteutensils craftsmanship, materials, care, and delivery.
        </p>
      </Reveal>

      <div className="mx-auto mt-8 max-w-3xl space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <Reveal key={faq.question} delay={idx * 0.05}>
              <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white transition-shadow duration-300 hover:shadow-card dark:border-ink-800 dark:bg-ink-900">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors duration-200"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {faq.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-semibold text-ink-900 dark:text-white">
                      {faq.question}
                    </h3>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200"
                  >
                    <ChevronDownIcon className="h-4 w-4" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <div className="border-t border-ink-100 px-5 pb-5 pt-3 text-sm leading-relaxed text-ink-600 dark:border-ink-800/80 dark:text-ink-300">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

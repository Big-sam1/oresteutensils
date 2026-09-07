import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircleIcon, CheckIcon } from 'lucide-react';

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  validate?: (value: string) => string | null;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}

/** Floating-label input with animated focus, blur validation and error shake. */
export function Field({
  label,
  name,
  type = 'text',
  value,
  onChange,
  validate,
  required = true,
  autoComplete,
  className = ''
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const runValidation = () => {
    setTouched(true);
    if (required && !value.trim()) {
      setError(`${label} is required`);
      return;
    }
    setError(validate ? validate(value) : null);
  };

  const floated = focused || value.length > 0;
  const valid = touched && !error && value.trim().length > 0;

  return (
    <div className={className}>
      <motion.div
        animate={
        error && touched ?
        { x: [0, -5, 5, -3, 3, 0] } :
        { x: 0 }
        }
        transition={{ duration: 0.32, ease: 'easeOut' }}
        className={`relative rounded-lg border bg-white transition-colors duration-200 dark:bg-ink-900 ${
        error && touched ?
        'border-red-400' :
        focused ?
        'border-brand-500' :
        'border-ink-200 dark:border-ink-700'}`
        }
        style={{
          boxShadow: focused ? '0 0 0 3px rgba(107,127,74,0.14)' : 'none'
        }}>
        
        <label
          htmlFor={name}
          className={`pointer-events-none absolute left-3 bg-white px-1 transition-all duration-200 ease-premium dark:bg-ink-900 ${
          floated ?
          '-top-2 text-[11px] font-semibold text-brand-600 dark:text-brand-300' :
          'top-3 text-sm text-ink-400'}`
          }>
          
          {label}
        </label>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error && touched)}
          aria-describedby={error && touched ? `${name}-error` : undefined}
          onChange={(e) => {
            onChange(e.target.value);
            if (touched) setError(null);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            runValidation();
          }}
          className="w-full bg-transparent px-3 py-3 pr-9 text-sm text-ink-900 outline-none dark:text-ink-100" />
        
        <span className="absolute right-3 top-3.5">
          <AnimatePresence mode="wait" initial={false}>
            {valid &&
            <motion.span
              key="ok"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white">
              
                <CheckIcon className="h-3 w-3" strokeWidth={3} />
              </motion.span>
            }
            {error && touched &&
            <motion.span
              key="err"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="text-red-500">
              
                <AlertCircleIcon className="h-5 w-5" />
              </motion.span>
            }
          </AnimatePresence>
        </span>
      </motion.div>

      <AnimatePresence>
        {error && touched &&
        <motion.p
          id={`${name}-error`}
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden pt-1.5 text-xs font-medium text-red-500">
          
            {error}
          </motion.p>
        }
      </AnimatePresence>
    </div>);

}
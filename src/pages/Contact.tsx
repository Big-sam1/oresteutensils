import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ExternalLinkIcon,
  Loader2Icon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SendIcon,
  SparklesIcon } from
'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Field } from '../components/ui/Field';
import { Reveal } from '../components/ui/Reveal';
import { FAQ } from '../components/home/FAQ';
import { ServiceBenefits } from '../components/layout/ServiceBenefits';
import { useStore } from '../contexts/StoreContext';

const mapUrl = "https://maps.google.com/?q=City+Plaza,+Kigali,+Rwanda";

const details = [
  { icon: MailIcon, label: 'Email', value: 'support@oresteutensils.com', href: 'mailto:support@oresteutensils.com' },
  { icon: PhoneIcon, label: 'Phone', value: '+250 788 123 456', href: 'tel:+250788123456' },
  { icon: MapPinIcon, label: 'Studio & Showroom', value: 'City Plaza, Kigali, Rwanda', href: mapUrl },
];

export function Contact() {
  const { pushToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSending(true);
    window.setTimeout(() => {
      try {
        const raw = localStorage.getItem("oreste_contact_messages");
        const list = raw ? JSON.parse(raw) : [];
        list.unshift({
          id: `msg_${Date.now()}`,
          name: name.trim(),
          email: email.trim(),
          subject: 'Storefront Customer Inquiry',
          message: message.trim(),
          date: new Date().toISOString(),
          status: 'New',
        });
        localStorage.setItem("oreste_contact_messages", JSON.stringify(list));
      } catch (e) {}

      setSending(false);
      setName('');
      setEmail('');
      setMessage('');
      pushToast('Thank you! Your message has been sent to Oresteutensils team.');
    }, 800);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
      
      <div className="mt-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
          <SparklesIcon className="h-3 w-3" />
          Get In Touch
        </span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl dark:text-white">
          Contact Oresteutensils
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-600 dark:text-ink-300 italic">
          “Deliciousness starts with the right tools, and presentation at the table is what makes every taste different.”
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Reveal>
          <form
            onSubmit={submit}
            className="space-y-5 rounded-2xl border border-ink-200 bg-white p-6 shadow-sm dark:border-ink-800 dark:bg-ink-900">
            
            <h2 className="text-lg font-bold text-ink-900 dark:text-white">
              Send us a Message
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Your name" name="contact-name" value={name} onChange={setName} />
              <Field
                label="Email address"
                name="contact-email"
                type="email"
                value={email}
                onChange={setEmail}
                validate={(v) =>
                /.+@.+\..+/.test(v) ? null : 'Enter a valid email address'
                } />
            </div>
            <div>
              <label
                htmlFor="contact-message"
                className="mb-1.5 block text-xs font-semibold text-ink-700 dark:text-ink-200">
                How can we help your culinary journey?
              </label>
              <textarea
                id="contact-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Inquire about cookware, custom culinary orders, or kitchen tools..."
                required
                className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-sm text-ink-900 outline-none transition-colors duration-200 focus:border-brand-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-100" />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="group flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-brand-600">
              
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={sending ? 'sending' : 'idle'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-2">
                  
                  {sending ?
                  <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      Sending...
                    </> :

                  <>
                      Send Message
                      <SendIcon className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
                    </>
                  }
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </form>
        </Reveal>

        <div className="space-y-6">
          <Reveal direction="left" delay={0.06}>
            <ul className="space-y-3">
              {details.map(({ icon: Icon, label, value, href }) =>
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-2xl border border-ink-200 bg-white p-4 transition-all duration-300 hover:border-brand-400 hover:shadow-card dark:border-ink-800 dark:bg-ink-900">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:bg-ink-800 dark:text-brand-300">
                      <Icon className="h-5 w-5 transition-transform duration-300 ease-premium group-hover:scale-110" />
                    </span>
                    <div>
                      <span className="block text-xs font-medium text-ink-400">{label}</span>
                      <span className="block text-sm font-bold text-ink-900 dark:text-white">
                        {value}
                      </span>
                    </div>
                  </div>
                  {href.startsWith('http') && (
                    <ExternalLinkIcon className="h-4 w-4 text-ink-400 transition-colors group-hover:text-brand-500" />
                  )}
                </a>
              </li>
              )}
            </ul>
          </Reveal>

          {/* Interactive Google Map Box for City Plaza, Kigali, Rwanda */}
          <Reveal direction="left" delay={0.12}>
            <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm dark:border-ink-800 dark:bg-ink-900">
              <div className="flex items-center justify-between border-b border-ink-100 p-4 dark:border-ink-800">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-brand-500" />
                  <span className="text-xs font-bold text-ink-900 dark:text-white">
                    City Plaza, Kigali, Rwanda
                  </span>
                </div>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
                  Open in Maps
                  <ExternalLinkIcon className="h-3 w-3" />
                </a>
              </div>
              <div className="h-56 w-full bg-cream-100 dark:bg-ink-950">
                <iframe
                  title="Oresteutensils Location at City Plaza Kigali Rwanda"
                  src="https://maps.google.com/maps?q=City%20Plaza,%20Kigali,%20Rwanda&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mt-16">
        <FAQ />
      </div>

      <div className="mt-12">
        <ServiceBenefits />
      </div>
    </div>);

}
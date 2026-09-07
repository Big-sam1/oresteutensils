import React from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsIcon,
  ArrowRightIcon,
  InstagramIcon,
  TwitterIcon,
  FacebookIcon,
  YoutubeIcon } from
'lucide-react';
import { Reveal } from '../ui/Reveal';
import { shopCategories } from '../../data/categories';

const columns = [
{
  title: 'Kitchen Shop',
  links: [
  { label: 'All Cookware & Tools', to: '/shop' },
  { label: 'Best Sellers', to: '/shop' },
  { label: 'Special Deals', to: '/deals' },
  { label: 'All Categories', to: '/categories' }]

},
{
  title: 'Customer Care',
  links: [
  { label: 'Contact Us', to: '/contact' },
  { label: 'Shipping & Delivery', to: '/contact' },
  { label: 'Returns & Warranty', to: '/contact' },
  { label: 'Culinary FAQ', to: '/contact' }]

}];


const socials = [InstagramIcon, TwitterIcon, FacebookIcon, YoutubeIcon];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-cream-50 dark:border-ink-800 dark:bg-ink-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8">
        <Reveal className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Oresteutensils logo"
                style={{ borderRadius: '100%' }}
                className="h-8 w-8 object-cover shadow-sm"
              />
              <span className="text-lg font-bold text-ink-900 dark:text-white">
                Oreste<span className="text-brand-500">utensils</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-ink-600 dark:text-ink-300 italic">
              “Deliciousness starts with the right tools, and presentation at the table is what makes every taste different.”
            </p>
            <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">
              City Plaza, Kigali, Rwanda
            </p>
            <div className="mt-4 flex gap-2">
              {socials.map((Icon, i) =>
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="group flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition-colors duration-200 hover:border-brand-400 hover:text-brand-600 dark:border-ink-700 dark:text-ink-400">
                
                  <Icon className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:-translate-y-0.5" />
                </a>
              )}
            </div>
          </div>

          {columns.map((col) =>
          <div key={col.title}>
              <h3 className="text-sm font-semibold text-ink-900 dark:text-white">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) =>
              <li key={link.label}>
                    <Link
                  to={link.to}
                  className="group relative inline-block text-sm text-ink-500 transition-colors duration-200 hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-200">
                  
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-brand-500 transition-transform duration-300 ease-premium group-hover:scale-x-100" />
                    </Link>
                  </li>
              )}
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-ink-900 dark:text-white">
              Stay in the loop
            </h3>
            <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
              New arrivals and members-only deals, once a week.
            </p>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => e.preventDefault()}>
              
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                placeholder="Email address"
                aria-label="Email address"
                className="min-w-0 flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
              
              <button
                type="submit"
                className="group flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600">
                
                Join
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {shopCategories.slice(0, 4).map((c) =>
              <Link
                key={c}
                to={`/shop?category=${encodeURIComponent(c)}`}
                className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink-500 transition-colors duration-200 hover:text-brand-600 dark:bg-ink-900 dark:text-ink-400">
                
                  {c}
                </Link>
              )}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-ink-200 pt-6 text-xs text-ink-400 sm:flex-row dark:border-ink-800">
          <p>© {new Date().getFullYear()} ShopMate. All rights reserved.</p>
          <p>Build by Dream Maker Developers DMD</p>
        </div>
      </div>
    </footer>);

}
import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ChevronDownIcon,
  HeartIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  ShoppingCartIcon,
  SunIcon,
  UserIcon,
  UserPlusIcon,
  UtensilsIcon } from
'lucide-react';
import { SearchBar } from './SearchBar';
import { MobileMenu } from './MobileMenu';
import { useStore } from '../../contexts/StoreContext';
import { useAuth } from '../../contexts/AuthContext';
import { shopCategories } from '../../data/categories';

const navLinks = [
{ label: 'Home', to: '/' },
{ label: 'Shop', to: '/shop' },
{ label: 'Categories', to: '/categories' },
{ label: 'Deals', to: '/deals' }];


const pageLinks = [
{ label: 'Cart', to: '/cart' },
{ label: 'Checkout', to: '/checkout' },
{ label: 'Contact', to: '/contact' },
{ label: 'Sign In', to: '/login' }];


export function Header() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { cartCount, cartBumpKey, wishlist, theme, toggleTheme } = useStore();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<'categories' | 'pages' | null>(null);
  const closeTimer = useRef<number>();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hoverOpen = (menu: 'categories' | 'pages') => {
    window.clearTimeout(closeTimer.current);
    setOpenMenu(menu);
  };
  const hoverClose = () => {
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 120);
  };

  return (
    <>
      <motion.header
        animate={{
          paddingTop: scrolled ? 8 : 14,
          paddingBottom: scrolled ? 8 : 14,
          boxShadow: scrolled ?
          '0 1px 0 rgba(23,26,22,0.06), 0 10px 30px -22px rgba(23,26,22,0.5)' :
          '0 1px 0 rgba(23,26,22,0.05)'
        }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="sticky top-0 z-[60] w-full border-b border-ink-100 bg-white/95 backdrop-blur dark:border-ink-800 dark:bg-ink-950/95">
        
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 sm:gap-4 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-ink-700 transition-colors duration-200 hover:bg-ink-50 lg:hidden dark:text-ink-200 dark:hover:bg-ink-800">
            
            <MenuIcon className="h-5 w-5" />
          </button>

          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2"
            aria-label="Oresteutensils home">
            
            <img
              src="/logo.png"
              alt="Oresteutensils logo"
              style={{ borderRadius: '100%' }}
              className="h-8 w-8 object-cover shadow-sm"
            />
            <span className="text-lg font-bold tracking-tight text-ink-900 dark:text-white">
              Oreste<span className="text-brand-500">utensils</span>
            </span>
          </Link>

          <div
            className="relative hidden md:block"
            onMouseEnter={() => hoverOpen('categories')}
            onMouseLeave={hoverClose}>
            
            <button
              type="button"
              aria-expanded={openMenu === 'categories'}
              onClick={() =>
              setOpenMenu(openMenu === 'categories' ? null : 'categories')
              }
              className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600">
              
              All Categories
              <motion.span
                animate={{ rotate: openMenu === 'categories' ? 180 : 0 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
                
                <ChevronDownIcon className="h-4 w-4" />
              </motion.span>
            </button>
            <Dropdown open={openMenu === 'categories'}>
              {shopCategories.map((c) =>
              <button
                key={c}
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  navigate(`/shop?category=${encodeURIComponent(c)}`);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink-700 transition-colors duration-150 hover:bg-brand-50 hover:text-brand-700 dark:text-ink-200 dark:hover:bg-ink-800 dark:hover:text-brand-200">
                
                  {c}
                </button>
              )}
            </Dropdown>
          </div>

          <div className="hidden min-w-0 flex-1 sm:block">
            <SearchBar compact={scrolled} />
          </div>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <IconButton
              label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleTheme}>
              
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -70, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 70, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                  className="block">
                  
                  {theme === 'dark' ?
                  <SunIcon className="h-5 w-5" /> :

                  <MoonIcon className="h-5 w-5" />
                  }
                </motion.span>
              </AnimatePresence>
            </IconButton>

            <IconButton
              label="Wishlist"
              onClick={() => navigate('/wishlist')}
              badge={wishlist.length || undefined}>
              
              <HeartIcon className="h-5 w-5" />
            </IconButton>


            {user ? (
              /* ── Logged in: show user name + logout ── */
              <div className="flex items-center gap-1">
                <div className="hidden sm:flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-ink-700 dark:text-ink-200">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white text-xs font-bold shrink-0">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="max-w-[90px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
                </div>
                <IconButton label="Logout" onClick={async () => { await logout(); navigate('/'); }}>
                  <LogOutIcon className="h-5 w-5" />
                </IconButton>
              </div>
            ) : (
              /* ── Guest: single icon with plus that directs user to login page ── */
              <IconButton label="Sign In / Join" onClick={() => navigate('/login')}>
                <UserPlusIcon className="h-5 w-5" />
              </IconButton>
            )}

            <div id="cart-anchor" className="relative">
              <IconButton label="Cart" onClick={() => navigate('/cart')}>
                <motion.span
                  key={cartBumpKey}
                  animate={
                  reduce ?
                  undefined :
                  { y: [0, -4, 0], rotate: [0, -8, 0] }
                  }
                  transition={{ duration: 0.36, ease: [0.23, 1, 0.32, 1] }}
                  className="block">
                  
                  <ShoppingCartIcon className="h-5 w-5" />
                </motion.span>
              </IconButton>
              <AnimatePresence>
                {cartCount > 0 &&
                <motion.span
                  key="badge"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className="pointer-events-none absolute -right-0.5 -top-0.5">
                  
                    <motion.span
                    key={cartBumpKey}
                    animate={reduce ? undefined : { scale: [1, 1.25, 1] }}
                    transition={{ duration: 0.34, ease: [0.23, 1, 0.32, 1] }}
                    className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white">
                    
                      {cartCount}
                    </motion.span>
                  </motion.span>
                }
              </AnimatePresence>
            </div>
          </div>
        </div>

        <nav
          aria-label="Main"
          className="mx-auto hidden w-full max-w-7xl items-center justify-center gap-1 px-4 pt-2 lg:flex lg:px-8">
          
          {navLinks.map((link) =>
          <NavLink key={link.to} to={link.to} end={link.to === '/'}>
              {({ isActive }) => <NavItem label={link.label} active={isActive} />}
            </NavLink>
          )}
          <div
            className="relative"
            onMouseEnter={() => hoverOpen('pages')}
            onMouseLeave={hoverClose}>
            
            <button
              type="button"
              aria-expanded={openMenu === 'pages'}
              className="group relative flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-ink-600 transition-colors duration-200 hover:text-brand-600 dark:text-ink-300 dark:hover:text-brand-200">
              
              Pages
              <motion.span
                animate={{ rotate: openMenu === 'pages' ? 180 : 0 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
                
                <ChevronDownIcon className="h-3.5 w-3.5" />
              </motion.span>
            </button>
            <Dropdown open={openMenu === 'pages'} align="center">
              {pageLinks.map((p) =>
              <Link
                key={p.to}
                to={p.to}
                onClick={() => setOpenMenu(null)}
                className="block rounded-lg px-3 py-2 text-sm text-ink-700 transition-colors duration-150 hover:bg-brand-50 hover:text-brand-700 dark:text-ink-200 dark:hover:bg-ink-800">
                
                  {p.label}
                </Link>
              )}
            </Dropdown>
          </div>
          <NavLink to="/blog">
            {({ isActive }) => <NavItem label="Blog" active={isActive} />}
          </NavLink>
          <NavLink to="/contact">
            {({ isActive }) => <NavItem label="Contact" active={isActive} />}
          </NavLink>
        </nav>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>);

}

function NavItem({ label, active }: {label: string;active: boolean;}) {
  return (
    <span
      className={`group relative block px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
      active ?
      'text-brand-600 dark:text-brand-200' :
      'text-ink-600 hover:text-brand-600 dark:text-ink-300 dark:hover:text-brand-200'}`
      }>
      
      {label}
      <span
        className={`absolute bottom-0 left-3 right-3 h-0.5 origin-left rounded-full bg-brand-500 transition-transform duration-300 ease-premium ${
        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`
        } />
      
    </span>);

}

function IconButton({
  children,
  label,
  onClick,
  badge





}: {children: React.ReactNode;label: string;onClick: () => void;badge?: number;}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
      className="relative rounded-lg p-2 text-ink-700 transition-colors duration-200 hover:bg-ink-50 hover:text-brand-600 dark:text-ink-200 dark:hover:bg-ink-800 dark:hover:text-brand-200">
      
      {children}
      {badge ?
      <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink-900 px-1 text-[11px] font-bold text-white dark:bg-white dark:text-ink-900">
          {badge}
        </span> :
      null}
    </motion.button>);

}

function Dropdown({
  open,
  children,
  align = 'left'




}: {open: boolean;children: React.ReactNode;align?: 'left' | 'center';}) {
  return (
    <AnimatePresence>
      {open &&
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        className={`absolute top-[calc(100%+8px)] z-50 w-56 rounded-xl border border-ink-200 bg-white p-1.5 shadow-lift dark:border-ink-800 dark:bg-ink-900 ${
        align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'}`
        }>
        
          {children}
        </motion.div>
      }
    </AnimatePresence>);

}
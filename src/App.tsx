import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation } from
'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { StoreProvider } from './contexts/StoreContext';
import { AuthProvider } from './contexts/AuthContext';
import { AdminDatabaseProvider } from './contexts/AdminDatabaseContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { BackToTop } from './components/layout/BackToTop';
import { ToastViewport } from './components/ui/Toast';
import { FlyToCart } from './components/ui/FlyToCart';
import { PageTransition, TransitionKind } from './components/PageTransition';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Categories } from './pages/Categories';
import { Deals } from './pages/Deals';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Wishlist } from './pages/Wishlist';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { Contact } from './pages/Contact';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const transitions: {path: string;kind: TransitionKind;}[] = [
{ path: '/product/', kind: 'slide-left' },
{ path: '/blog/', kind: 'slide-left' },
{ path: '/cart', kind: 'slide-left' },
{ path: '/checkout', kind: 'slide-left' },
{ path: '/shop', kind: 'slide-up' },
{ path: '/deals', kind: 'slide-up' },
{ path: '/categories', kind: 'slide-up' },
{ path: '/login', kind: 'scale' },
{ path: '/register', kind: 'scale' },
{ path: '/wishlist', kind: 'scale' },
{ path: '/admin', kind: 'fade' }];


function kindFor(pathname: string): TransitionKind {
  return transitions.find((t) => pathname.startsWith(t.path))?.kind ?? 'fade';
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  const kind = kindFor(location.pathname);

  return (
    <PageTransition key={location.pathname} kind={kind}>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </PageTransition>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <div className="min-h-screen w-full bg-[#f4f6f8] text-gray-900">
        <AnimatedRoutes />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-white text-ink-800 dark:bg-ink-950 dark:text-ink-100">
      <ScrollToTop />
      <Header />
      <div className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden">
        <AnimatedRoutes />
      </div>
      <Footer />
      <BackToTop />
      <ToastViewport />
      <FlyToCart />
    </div>
  );
}

export function App() {
  return (
    <AdminDatabaseProvider>
      <StoreProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </StoreProvider>
    </AdminDatabaseProvider>);

}
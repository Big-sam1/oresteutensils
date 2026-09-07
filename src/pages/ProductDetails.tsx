import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, HeartIcon, StarIcon, MessageSquarePlusIcon } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Gallery } from '../components/product/Gallery';
import { QuantitySelector } from '../components/product/QuantitySelector';
import { AddToCartButton } from '../components/AddToCartButton';
import { StarRating } from '../components/ui/StarRating';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { ServiceBenefits } from '../components/layout/ServiceBenefits';
import { SectionHeader } from '../components/SectionHeader';
import { ProductCarousel } from '../components/ProductCarousel';
import { QuickViewModal } from '../components/QuickViewModal';
import { DetailsSkeleton } from '../components/ui/Skeleton';
import { Reveal } from '../components/ui/Reveal';
import { getProduct, relatedProducts } from '../data/products';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { useAdminDatabase } from '../contexts/AdminDatabaseContext';
import { currency } from '../utils/format';
import { Product } from '../types';

const tabs = [
'Description',
'Additional Information',
'Reviews',
'Shipping & Returns'] as
const;

export function ProductDetails() {
  const { slug = '' } = useParams();
  const { products, reviews, addReview } = useAdminDatabase();
  const { user } = useAuth();
  const product = products.find((p) => p.slug === slug) || getProduct(slug);
  const { toggleWishlist, isWishlisted, pushToast } = useStore();
  const galleryRef = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState(product?.colors[0]?.name ?? '');
  const [tab, setTab] = useState<(typeof tabs)[number]>('Description');
  const [loading, setLoading] = useState(true);
  const [quickView, setQuickView] = useState<Product | null>(null);

  // Rating & Review form state
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingHover, setRatingHover] = useState(0);
  const [reviewName, setReviewName] = useState(user?.displayName || user?.email?.split('@')[0] || '');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Product reviews
  const productReviews = reviews.filter((r) => r.productId === product?.id);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewComment.trim()) return;
    setReviewSubmitting(true);
    try {
      await addReview(
        product.id,
        ratingStars,
        reviewName.trim() || 'Anonymous Chef',
        reviewComment.trim()
      );
      setReviewComment('');
      setReviewSuccess(true);
      pushToast('Thank you! Your rating & review has been published.');
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    setColor(product?.colors[0]?.name ?? '');
    const id = window.setTimeout(() => setLoading(false), 380);
    return () => window.clearTimeout(id);
  }, [slug, product]);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">
          Product not found
        </h1>
        <Link
          to="/shop"
          className="mt-4 inline-block text-sm font-semibold text-brand-600">
          
          Back to shop
        </Link>
      </div>);

  }

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8 overflow-hidden min-w-0">
      <Breadcrumbs
        items={[
        { label: 'Home', to: '/' },
        { label: product.category, to: `/shop?category=${product.category}` },
        { label: product.name }]
        } />
      

      <div className="mt-5 w-full min-w-0">
        {loading ?
        <DetailsSkeleton /> :

        <div className="grid gap-8 lg:grid-cols-2 min-w-0 items-start">
            <Reveal direction="none" scale className="min-w-0 w-full">
              <div ref={galleryRef} className="w-full min-w-0">
                <Gallery images={product.images} name={product.name} />
              </div>
            </Reveal>

            <Reveal direction="right" delay={0.06} className="min-w-0 w-full">
              <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-white break-words">
                {product.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <StarRating
                rating={product.rating}
                reviews={product.reviews}
                size="md" />
              
                <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                product.inStock ?
                'bg-brand-50 text-brand-700 dark:bg-ink-800 dark:text-brand-200' :
                'bg-red-50 text-red-600'}`
                }>
                
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <p className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-ink-900 dark:text-white">
                  <AnimatedNumber value={product.price * quantity} />
                </span>
                {product.oldPrice &&
              <span className="text-base text-ink-400 line-through">
                    {currency(product.oldPrice)}
                  </span>
              }
              </p>

              <p className="mt-4 max-w-lg text-sm leading-6 text-ink-600 dark:text-ink-300">
                {product.description}
              </p>

              {product.colors.length > 1 &&
            <div className="mt-6">
                  <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">
                    Color: <span className="font-medium">{color}</span>
                  </p>
                  <div className="mt-2 flex gap-2">
                    {product.colors.map((c) =>
                <motion.button
                  key={c.name}
                  type="button"
                  aria-label={c.name}
                  aria-pressed={color === c.name}
                  onClick={() => setColor(c.name)}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ duration: 0.16 }}
                  className={`relative h-8 w-8 rounded-full border-2 ${
                  color === c.name ?
                  'border-brand-500' :
                  'border-ink-200 dark:border-ink-700'}`
                  }
                  style={{ backgroundColor: c.hex }}>
                  
                        <AnimatePresence>
                          {color === c.name &&
                    <motion.span
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="absolute inset-0 flex items-center justify-center">
                      
                              <CheckIcon
                        className="h-3.5 w-3.5 text-white mix-blend-difference"
                        strokeWidth={3} />
                      
                            </motion.span>
                    }
                        </AnimatePresence>
                      </motion.button>
                )}
                  </div>
                </div>
            }

              <div className="mt-6">
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">
                  Quantity
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <QuantitySelector value={quantity} onChange={setQuantity} />
                  <div className="w-40">
                    <AddToCartButton
                    product={product}
                    quantity={quantity}
                    color={color}
                    originRef={galleryRef}
                    size="md" />
                  
                  </div>
                  <Link
                  to="/checkout"
                  className="inline-flex h-11 items-center rounded-lg border border-ink-300 px-5 text-sm font-semibold text-ink-800 transition-colors duration-200 hover:border-brand-400 hover:text-brand-700 dark:border-ink-700 dark:text-ink-100">
                  
                    Buy Now
                  </Link>
                </div>
              </div>

              <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className="group mt-5 inline-flex items-center gap-2 text-sm font-medium text-ink-600 transition-colors duration-200 hover:text-red-500 dark:text-ink-300">
              
                <HeartIcon
                className={`h-4 w-4 transition-all duration-300 ease-premium group-hover:scale-110 ${
                wishlisted ? 'fill-red-500 text-red-500' : ''}`
                } />
              
                {wishlisted ? 'In your Wishlist' : 'Add to Wishlist'}
              </button>
            </Reveal>
          </div>
        }
      </div>

      <div className="mt-10">
        <ServiceBenefits />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Reveal>
          <div className="flex flex-wrap gap-1 border-b border-ink-200 dark:border-ink-800">
            {tabs.map((t) =>
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-selected={tab === t}
              role="tab"
              className={`relative px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
              tab === t ?
              'text-brand-600 dark:text-brand-200' :
              'text-ink-500 hover:text-ink-800 dark:text-ink-400'}`
              }>
              
                {t}
                {tab === t && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-500" />
                )}
              </button>
            )}
          </div>

          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="pt-4 text-sm leading-6 text-ink-600 dark:text-ink-300">
              
              {tab === 'Description' &&
              <>
                  <p>{product.description}</p>
                  <ul className="mt-3 space-y-1.5">
                    {product.features.map((f) =>
                  <li key={f} className="flex items-start gap-2">
                        <CheckIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-500" />
                        {f}
                      </li>
                  )}
                  </ul>
                </>
              }
              {tab === 'Additional Information' &&
              <dl className="grid gap-2 sm:grid-cols-2">
                  <Spec label="Category" value={product.category} />
                  <Spec
                  label="Colors"
                  value={product.colors.map((c) => c.name).join(', ')} />
                
                  <Spec label="SKU" value={product.id.toUpperCase()} />
                  <Spec label="Warranty" value="2 years" />
                </dl>
              }
              {tab === 'Reviews' &&
                <div className="space-y-6">
                  {/* Reviews Summary Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-cream-50 dark:bg-ink-900/60 border border-ink-100 dark:border-ink-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-ink-900 dark:text-white">
                          {product.rating.toFixed(1)}
                        </span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.round(product.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-ink-200 dark:text-ink-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                        Based on {product.reviews} verified customer review{product.reviews !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <a
                      href="#write-review"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 transition"
                    >
                      <MessageSquarePlusIcon className="h-3.5 w-3.5" />
                      Rate & Review
                    </a>
                  </div>

                  {/* List of customer reviews */}
                  <div className="space-y-3">
                    {productReviews.length > 0 ? (
                      productReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-4 rounded-xl border border-ink-100 bg-white shadow-xs dark:border-ink-800 dark:bg-ink-900/80"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-ink-900 text-xs dark:text-white">
                              {rev.author}
                            </span>
                            <span className="text-[10px] text-ink-400">{rev.date}</span>
                          </div>
                          <div className="flex text-amber-500 my-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-ink-200 dark:text-ink-700'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed mt-1">
                            {rev.comment}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-ink-500 italic py-2">
                        No customer reviews yet. Be the first to rate this product below!
                      </p>
                    )}
                  </div>

                  {/* Interactive Rate & Review Form */}
                  <div
                    id="write-review"
                    className="p-5 rounded-2xl border border-brand-500/20 bg-brand-50/40 dark:bg-brand-950/20 dark:border-brand-500/30"
                  >
                    <h3 className="text-sm font-bold text-ink-900 dark:text-white flex items-center gap-2">
                      <StarIcon className="h-4 w-4 text-amber-500 fill-amber-500" />
                      Leave Your Rating & Review
                    </h3>
                    <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 mb-3">
                      Share your feedback to help fellow chefs and home cooks.
                    </p>

                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      {/* 1-5 Star Interactive Selector */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 dark:text-ink-300 mb-1">
                          Your Rating *
                        </label>
                        <div className="flex items-center gap-1 cursor-pointer">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingStars(star)}
                              onMouseEnter={() => setRatingHover(star)}
                              onMouseLeave={() => setRatingHover(0)}
                              className="p-1 hover:scale-115 transition"
                            >
                              <StarIcon
                                className={`h-6 w-6 transition-colors ${
                                  star <= (ratingHover || ratingStars)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-ink-300 dark:text-ink-700'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-xs font-bold text-amber-600 ml-2">
                            {ratingHover || ratingStars} Star{(ratingHover || ratingStars) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 dark:text-ink-300 mb-1">
                          Your Name / Handle
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          placeholder="e.g. Maria Gonzalez"
                          className="w-full rounded-xl border border-ink-200 bg-white py-2 px-3 text-xs text-ink-900 outline-none focus:border-brand-500 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
                        />
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 dark:text-ink-300 mb-1">
                          Review Feedback *
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="How did this product perform in your kitchen? What did you love?"
                          className="w-full rounded-xl border border-ink-200 bg-white py-2 px-3 text-xs text-ink-900 outline-none focus:border-brand-500 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
                        />
                      </div>

                      {reviewSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 border border-emerald-200">
                          <CheckIcon className="h-4 w-4 text-emerald-600" />
                          Review submitted and saved to Firebase Realtime Database!
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={reviewSubmitting || !reviewComment.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-600 transition disabled:opacity-60"
                      >
                        {reviewSubmitting ? 'Publishing...' : 'Submit Rating & Review'}
                      </button>
                    </form>
                  </div>
                </div>
              }
              {tab === 'Shipping & Returns' &&
              <p>
                  Free standard shipping on orders over 50,000 FRW, dispatched within
                  24 hours. Returns are free for 30 days from delivery.
                </p>
              }
            </motion.div>
        </Reveal>

        <Reveal direction="left" delay={0.05}>
          <h2 className="text-base font-bold text-ink-900 dark:text-white">
            You may also like
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {relatedProducts(product).
            slice(0, 2).
            map((p) =>
            <div key={p.id}>
                  <Link
                to={`/product/${p.slug}`}
                className="group block overflow-hidden rounded-xl border border-ink-200 bg-white p-3 transition-shadow duration-300 hover:shadow-card dark:border-ink-800 dark:bg-ink-900">
                
                    <div className="overflow-hidden rounded-lg bg-cream-50 dark:bg-ink-800">
                      <img
                    src={p.images[0]}
                    alt={p.name}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform duration-500 ease-premium group-hover:scale-105" />
                  
                    </div>
                    <p className="mt-2 text-sm font-semibold text-ink-900 dark:text-white">
                      {p.name}
                    </p>
                    <StarRating
                  rating={p.rating}
                  reviews={p.reviews}
                  className="mt-1" />
                
                    <p className="mt-1 text-sm font-bold text-ink-900 dark:text-white">
                      {currency(p.price)}
                    </p>
                  </Link>
                </div>
            )}
          </div>
        </Reveal>
      </div>

      <section className="mt-12" aria-label="Related products">
        <SectionHeader title="Related Products" linkLabel="Shop all" to="/shop" />
        <ProductCarousel
          products={relatedProducts(product)}
          onQuickView={setQuickView} />
        
      </section>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </div>);

}

function Spec({ label, value }: {label: string;value: string;}) {
  return (
    <div className="flex justify-between gap-3 border-b border-ink-100 py-1.5 dark:border-ink-800">
      <dt className="text-ink-500 dark:text-ink-400">{label}</dt>
      <dd className="font-medium text-ink-800 dark:text-ink-100">{value}</dd>
    </div>);

}
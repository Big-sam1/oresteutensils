import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  LightbulbIcon,
  Share2Icon,
  SparklesIcon,
  TagIcon,
} from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Reveal } from '../components/ui/Reveal';
import { ServiceBenefits } from '../components/layout/ServiceBenefits';
import { blogPosts as staticBlogPosts } from '../data/blog';
import { supabase } from '../supabase';
import { useStore } from '../contexts/StoreContext';

function getAllBlogPosts() {
  try {
    const stored = localStorage.getItem('oreste_admin_blog_posts');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return staticBlogPosts;
}

export function BlogPost() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { pushToast } = useStore();

  const [allPosts, setAllPosts] = useState(getAllBlogPosts);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'oreste_admin_blog_posts') setAllPosts(getAllBlogPosts());
    };
    const onFocus = () => setAllPosts(getAllBlogPosts());
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);

    // Fetch from Supabase cloud database
    async function syncFromSupabase() {
      try {
        const { data, error } = await supabase.from('blog_posts').select('*');
        if (!error && data && data.length > 0) {
          const list = data.map((d: any) => ({
            id: d.id,
            slug: d.slug,
            title: d.title,
            excerpt: d.excerpt,
            tag: d.tag || 'Culinary',
            date: d.date,
            readTime: d.read_time || d.readTime || '4 min read',
            image: d.image,
            author: d.author || {
              name: 'Elena Vance',
              role: 'Travel Editor & Product Lead',
              avatar: 'https://i.pravatar.cc/128?img=45',
            },
            intro: d.intro || '',
            sections: d.sections || [],
            conclusion: d.conclusion || '',
          }));
          setAllPosts(list);
          try {
            localStorage.setItem('oreste_admin_blog_posts', JSON.stringify(list));
          } catch (_) {}
        }
      } catch (_) {}
    }
    syncFromSupabase();

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const post = allPosts.find((p) => p.slug === slug || p.id === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">
          Article Not Found
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          The requested journal article could not be found.
        </p>
        <Link
          to="/blog"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Journal
        </Link>
      </div>
    );
  }

  const related = allPosts.filter((p) => p.id !== post.id);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      pushToast('Article link copied to clipboard!', 'success');
    } else {
      pushToast('Link ready to share', 'info');
    }
  };

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Blog', to: '/blog' },
          { label: post.title },
        ]}
      />

      {/* Back Link */}
      <div className="mt-4">
        <Link
          to="/blog"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-600 hover:text-brand-700 dark:text-brand-300"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to all articles
        </Link>
      </div>

      {/* Article Header */}
      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-ink-500 dark:text-ink-400">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700 dark:bg-ink-800 dark:text-brand-300">
            <TagIcon className="h-3 w-3" />
            {post.tag}
          </span>
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            {post.date}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl leading-[1.12] dark:text-white">
          {post.title}
        </h1>

        <p className="mt-4 text-base sm:text-lg leading-relaxed text-ink-600 dark:text-ink-300 font-medium">
          {post.excerpt}
        </p>

        {/* Author Details & Share Button */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-ink-100 py-4 dark:border-ink-800">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-11 w-11 rounded-full object-cover border-2 border-brand-500/20"
            />
            <div>
              <p className="text-sm font-bold text-ink-900 dark:text-white">
                {post.author.name}
              </p>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                {post.author.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 shadow-sm transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200"
          >
            <Share2Icon className="h-3.5 w-3.5" />
            Share Article
          </button>
        </div>
      </header>

      {/* Featured Hero Image */}
      <div className="mt-8 overflow-hidden rounded-2xl bg-cream-100 shadow-lift dark:bg-ink-800">
        <img
          src={post.image}
          alt={post.title}
          className="aspect-[16/9] w-full object-cover"
        />
      </div>

      {/* Main Content Body */}
      <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
        {/* Intro Blockquote */}
        <div className="rounded-2xl bg-cream-50/80 p-6 border-l-4 border-brand-500 dark:bg-ink-900/60">
          <p className="text-base leading-relaxed text-ink-800 font-medium italic dark:text-ink-100">
            “{post.intro}”
          </p>
        </div>

        {/* Dynamic Sections */}
        <div className="mt-8 space-y-8">
          {post.sections.map((section, idx) => (
            <Reveal key={section.heading} delay={idx * 0.05}>
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
                  {section.heading}
                </h2>

                {section.body.map((paragraph, pIdx) => (
                  <p
                    key={pIdx}
                    className="text-base leading-relaxed text-ink-700 dark:text-ink-300"
                  >
                    {paragraph}
                  </p>
                ))}

                {/* Pro Tip Card if available */}
                {section.tip && (
                  <div className="mt-4 flex items-start gap-3 rounded-xl bg-brand-50/70 p-4 text-sm text-brand-900 dark:bg-brand-950/40 dark:text-brand-200 border border-brand-500/20">
                    <LightbulbIcon className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400 mt-0.5" />
                    <div>
                      <strong className="font-bold">Pro Tip: </strong>
                      {section.tip}
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {/* Conclusion */}
        <div className="mt-10 border-t border-ink-200 pt-6 dark:border-ink-800">
          <h3 className="text-lg font-bold text-ink-900 dark:text-white">
            Final Thoughts
          </h3>
          <p className="mt-2 text-base leading-relaxed text-ink-700 dark:text-ink-300">
            {post.conclusion}
          </p>
        </div>
      </div>

      {/* Related Articles Section */}
      <section className="mt-16 border-t border-ink-200 pt-10 dark:border-ink-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-ink-900 dark:text-white">
            More from the Journal
          </h2>
          <Link
            to="/blog"
            className="text-xs font-bold uppercase tracking-wider text-brand-600 hover:underline dark:text-brand-300"
          >
            View all
          </Link>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {related.slice(0, 2).map((rel) => (
            <Link
              key={rel.id}
              to={`/blog/${rel.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm transition-all duration-300 hover:border-brand-400 hover:shadow-card dark:border-ink-800 dark:bg-ink-900"
            >
              <div className="overflow-hidden">
                <img
                  src={rel.image}
                  alt={rel.title}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover transition-transform duration-500 ease-premium group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  {rel.tag} · {rel.date}
                </span>
                <h3 className="mt-2 text-base font-bold text-ink-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">
                  {rel.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-ink-500 dark:text-ink-400 line-clamp-2">
                  {rel.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-300">
                  Read article
                  <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Service Benefits */}
      <div className="mt-16">
        <ServiceBenefits />
      </div>
    </article>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, SparklesIcon } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { StaggerGrid, staggerItem } from '../components/ui/Reveal';
import { ServiceBenefits } from '../components/layout/ServiceBenefits';
import { blogPosts as staticBlogPosts } from '../data/blog';
import { supabase } from '../supabase';

function getAdminBlogPosts() {
  try {
    const stored = localStorage.getItem('oreste_admin_blog_posts');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return staticBlogPosts;
}

export function Blog() {
  const [blogPosts, setBlogPosts] = useState(getAdminBlogPosts);

  useEffect(() => {
    // 1. Re-read on local storage changes
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'oreste_admin_blog_posts') {
        setBlogPosts(getAdminBlogPosts());
      }
    };
    window.addEventListener('storage', onStorage);
    const onFocus = () => setBlogPosts(getAdminBlogPosts());
    window.addEventListener('focus', onFocus);

    // 2. Fetch directly from Supabase so any visitor/device sees permanent articles
    async function fetchFromSupabase() {
      try {
        const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
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
          setBlogPosts(list);
          try {
            localStorage.setItem('oreste_admin_blog_posts', JSON.stringify(list));
          } catch (_) {}
        }
      } catch (_) {}
    }
    fetchFromSupabase();

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog' }]} />
      
      <div className="mt-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
          <SparklesIcon className="h-3 w-3" />
          The Oresteutensils Journal
        </span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl dark:text-white">
          From the Journal
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-600 dark:text-ink-300">
          Culinary guides, kitchen tool mastery, packing methods, and craftsmanship stories from our team.
        </p>
      </div>

      <StaggerGrid className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) =>
        <motion.article
          key={post.id}
          variants={staggerItem}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
          className="group flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm transition-all duration-300 hover:border-brand-400 hover:shadow-card dark:border-ink-800 dark:bg-ink-900">
          
            <Link to={`/blog/${post.slug}`} className="block overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover transition-transform duration-500 ease-premium group-hover:scale-105" />
            </Link>

            <div className="flex flex-1 flex-col p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                {post.tag} · {post.date}
              </span>

              <Link to={`/blog/${post.slug}`}>
                <h2 className="mt-2 text-base font-bold leading-snug text-ink-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">
                  {post.title}
                </h2>
              </Link>

              <p className="mt-2 flex-1 text-sm leading-6 text-ink-500 dark:text-ink-400 line-clamp-3">
                {post.excerpt}
              </p>

              <Link
                to={`/blog/${post.slug}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300">
                Read article
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.article>
        )}
      </StaggerGrid>

      <div className="mt-16">
        <ServiceBenefits />
      </div>
    </div>);

}
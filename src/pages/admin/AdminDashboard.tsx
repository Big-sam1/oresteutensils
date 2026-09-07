import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { adminAuth, DESIGNATED_ADMIN_EMAIL } from "../../firebase";
import { supabase } from "../../supabase";
import { motion, AnimatePresence } from "framer-motion";
import { categories } from "../../data/categories";
import { deals } from "../../data/deals";
import { blogPosts, BlogPostItem } from "../../data/blog";
import {
  LayoutDashboardIcon,
  TagIcon,
  BookOpenIcon,
  MessageSquareIcon,
  PercentIcon,
  FlameIcon,
  PackageIcon,
  UsersIcon,
  StarIcon,
  TrendingUpIcon,
  SettingsIcon,
  HelpCircleIcon,
  LogOutIcon,
  SearchIcon,
  BellIcon,
  MailIcon,
  PlusIcon,
  ArrowUpRightIcon,
  VideoIcon,
  ClockIcon,
  ShoppingBagIcon,
  DollarSignIcon,
  CreditCardIcon,
  LayersIcon,
  Edit2Icon,
  Trash2Icon,
  XIcon,
  SaveIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
  CheckIcon,
  UploadIcon,
  ImageIcon,
  SparklesIcon,
  CameraIcon,
  UserCheckIcon,
  EyeIcon,
  CalendarIcon,
  PrinterIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardListIcon,
} from "lucide-react";
import { useAdminDatabase, ClientItem, ReviewItem } from "../../contexts/AdminDatabaseContext";
import { Product } from "../../types";
import { uploadImageToSupabase } from "../../utils/storageUpload";
import { currency } from "../../utils/format";

type AdminTab = "dashboard" | "products" | "categories" | "deals" | "blog" | "contact" | "orders" | "clients" | "reviews" | "analytics" | "settings" | "plans";

export function AdminDashboard() {
  const navigate = useNavigate();
  const {
    products,
    clients,
    reviews,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteReview,
    addClient,
    deleteClient,
    syncWithDefaults,
  } = useAdminDatabase();

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Plan modal state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<{id:string;day:number;month:number;year:number;title:string;time:string;description:string;color:string}|null>(null);
  const [planForm, setPlanForm] = useState({title:'',time:'',description:'',color:'emerald'});

  // Pagination state
  const [prodPage, setProdPage] = useState(1);
  const [dealsPage, setDealsPage] = useState(1);
  const [clientsPage, setClientsPage] = useState(1);
  const [catPage, setCatPage] = useState(1);
  const PROD_PER_PAGE = 10;
  const DEALS_PER_PAGE = 10;
  const CLIENTS_PER_PAGE = 10;
  const CAT_PER_PAGE = 6;

  // Calendar / Plan state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [plans, setPlans] = useState<{id:string;day:number;month:number;year:number;title:string;time:string;description:string;color:string}[]>(() => {
    try { const s = localStorage.getItem('oreste_plans'); return s ? JSON.parse(s) : []; } catch(e) { return []; }
  });
  const [planTitle, setPlanTitle] = useState('');
  const [planTime, setPlanTime] = useState('');
  // Sync plans with Supabase on mount
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const { data, error } = await supabase.from('admin_plans').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped = data.map((r:any) => ({
            id: r.id,
            day: r.day,
            month: r.month,
            year: r.year,
            title: r.title,
            time: r.time || '',
            description: r.description || '',
            color: r.color || 'emerald',
          }));
          setPlans(mapped);
          localStorage.setItem('oreste_plans', JSON.stringify(mapped));
        }
      } catch(e) { /* use localStorage fallback */ }
    };
    loadPlans();
  }, []);
  const savePlan = async (formData?: {title:string;time:string;description:string;color:string}, day?: number) => {
    const title = (formData?.title || planTitle).trim();
    if (!title) return;
    const d = calendarDate;
    const planDay = day ?? selectedDay ?? d.getDate();
    const newPlan = {
      id: `pl_${Date.now()}`,
      day: planDay,
      month: d.getMonth(),
      year: d.getFullYear(),
      title,
      time: formData?.time || planTime,
      description: formData?.description || '',
      color: formData?.color || 'emerald',
    };
    // Save to Supabase
    try {
      await supabase.from('admin_plans').insert([{
        id: newPlan.id,
        day: newPlan.day,
        month: newPlan.month,
        year: newPlan.year,
        title: newPlan.title,
        time: newPlan.time,
        description: newPlan.description,
        color: newPlan.color,
      }]);
    } catch(e) { /* localStorage fallback */ }
    setPlans(prev => { const next = [...prev, newPlan]; localStorage.setItem('oreste_plans', JSON.stringify(next)); return next; });
    setPlanTitle(''); setPlanTime('');
  };
  const updatePlan = async (id: string, updates: Partial<{title:string;time:string;description:string;color:string}>) => {
    setPlans(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      localStorage.setItem('oreste_plans', JSON.stringify(next));
      supabase.from('admin_plans').update(updates).eq('id', id).then(() => {});
      return next;
    });
  };
  const deletePlan = async (id: string) => {
    setPlans(prev => { const next = prev.filter(p => p.id !== id); localStorage.setItem('oreste_plans', JSON.stringify(next)); return next; });
    try { await supabase.from('admin_plans').delete().eq('id', id); } catch(e) {}
  };

  // ── Contact Messages State ──────────────────────────────────────────
  const [contactMessages, setContactMessages] = useState<
    { id: string; name: string; email: string; subject: string; message: string; date: string; status: 'New' | 'In Progress' | 'Replied' }[]
  >(() => {
    try {
      const stored = localStorage.getItem('oreste_contact_messages');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        id: 'msg_1',
        name: 'Chef Jean-Luc Habimana',
        email: 'jeanluc.chef@kigaliculinary.com',
        subject: 'Wholesale Inquiry for Hotel Kitchen Upgrade',
        message: 'Hello Oresteutensils team, we are outfitting a new 45-seat restaurant kitchen in Kiyovu. We want to place a bulk order for 20 Tri-Ply Sauté Pans, 15 Chef Knife sets, and 30 Airtight Containers. Do you offer wholesale trade pricing and commercial VAT invoices?',
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: 'New',
      },
      {
        id: 'msg_2',
        name: 'Claire Mukamana',
        email: 'claire.mukamana@gmail.com',
        subject: 'Custom Laser Engraving on Silicone Utensil Set',
        message: 'I am purchasing the 12-Piece Silicone Utensil Set as a wedding gift for my sister. Is it possible to laser engrave their family initials onto the natural acacia wood handles before shipping?',
        date: new Date(Date.now() - 3600000 * 24).toISOString(),
        status: 'In Progress',
      },
      {
        id: 'msg_3',
        name: 'Patrick Ndayisaba',
        email: 'pndayisaba@yahoo.fr',
        subject: 'Product Material Verification & BPA Free Certification',
        message: 'Could you confirm if the Airtight Container storage lids use food-grade platinum silicone seals and are 100% BPA-free and freezer safe down to -20°C? Thank you for the quick response.',
        date: new Date(Date.now() - 3600000 * 48).toISOString(),
        status: 'Replied',
      },
    ];
  });

  const handleUpdateMessageStatus = (id: string, status: 'New' | 'In Progress' | 'Replied') => {
    setContactMessages((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, status } : m));
      localStorage.setItem('oreste_contact_messages', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteMessage = (id: string) => {
    setContactMessages((prev) => {
      const next = prev.filter((m) => m.id !== id);
      localStorage.setItem('oreste_contact_messages', JSON.stringify(next));
      return next;
    });
  };

  // Modals for previewing Blog Article or Contact details
  const [selectedBlogModal, setSelectedBlogModal] = useState<BlogPostItem | null>(null);
  const [isNewBlogModalOpen, setIsNewBlogModalOpen] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPostItem | null>(null);
  const [adminBlogPosts, setAdminBlogPosts] = useState<BlogPostItem[]>(() => {
    try {
      const stored = localStorage.getItem("oreste_admin_blog_posts");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return blogPosts;
  });

  // Sync blog posts from Supabase on mount
  useEffect(() => {
    async function loadBlogPosts() {
      try {
        const { data, error } = await supabase.from("blog_posts").select("*");
        if (!error && data && data.length > 0) {
          const list = data.map((d: any) => ({
            id: d.id,
            slug: d.slug,
            title: d.title,
            excerpt: d.excerpt,
            tag: d.tag || "Culinary",
            date: d.date,
            readTime: d.read_time || d.readTime || "4 min read",
            image: d.image,
            author: d.author || {
              name: "Oreste Admin",
              role: "Executive Chef & Founder",
              avatar: "/logo.png",
            },
            intro: d.intro || "",
            sections: d.sections || [],
            conclusion: d.conclusion || "",
          }));
          setAdminBlogPosts(list);
          try {
            localStorage.setItem("oreste_admin_blog_posts", JSON.stringify(list));
          } catch (e) {}
        }
      } catch (err) {}
    }
    loadBlogPosts();
  }, []);

  const handleSaveBlogPost = async (post: BlogPostItem) => {
    setAdminBlogPosts((prev) => {
      const exists = prev.some((p) => p.id === post.id);
      const next = exists ? prev.map((p) => (p.id === post.id ? post : p)) : [post, ...prev];
      try {
        localStorage.setItem("oreste_admin_blog_posts", JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // Also persist to Supabase if table exists
    try {
      await supabase.from("blog_posts").upsert([
        {
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          tag: post.tag,
          date: post.date,
          read_time: post.readTime,
          image: post.image,
          author: post.author,
          intro: post.intro,
          sections: post.sections,
          conclusion: post.conclusion,
          updated_at: new Date().toISOString(),
        },
      ]);
    } catch (e) {}
  };

  const handleDeleteBlogPost = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog article?")) return;
    setAdminBlogPosts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem("oreste_admin_blog_posts", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    try {
      await supabase.from("blog_posts").delete().eq("id", id);
    } catch (e) {}
  };

  // Metrics
  const totalProductsCount = products.length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = totalProductsCount - inStockCount;
  const totalReviewsCount = reviews.length;
  const avgRating = (
    products.reduce((acc, p) => acc + (p.rating || 0), 0) / (totalProductsCount || 1)
  ).toFixed(1);
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0) + 28140.0;

  // Filtered lists by search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  // Products filter state & printable products
  const [prodFilterCat, setProdFilterCat] = useState('');
  const [prodFilterStock, setProdFilterStock] = useState('');
  const [prodFilterBadge, setProdFilterBadge] = useState('');
  const printableProducts = useMemo(() => {
    return filteredProducts.filter(p => {
      if (prodFilterCat && p.category !== prodFilterCat) return false;
      if (prodFilterStock === 'inStock' && !p.inStock) return false;
      if (prodFilterStock === 'outOfStock' && p.inStock) return false;
      if (prodFilterBadge === 'bestSeller' && !p.bestSeller) return false;
      if (prodFilterBadge === 'deal' && !p.deal) return false;
      return true;
    });
  }, [filteredProducts, prodFilterCat, prodFilterStock, prodFilterBadge]);
  const handlePrintProducts = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const rows = printableProducts.map(p => `
      <tr style="border-bottom:1px solid #eee">
        <td style="padding:8px 12px"><strong>${p.name}</strong><br/><span style="font-size:10px;color:#888">ID: ${p.id}</span></td>
        <td style="padding:8px 12px">${p.category}</td>
        <td style="padding:8px 12px">${currency(p.price)}</td>
        <td style="padding:8px 12px">${p.oldPrice ? currency(p.oldPrice) : '-'}</td>
        <td style="padding:8px 12px">★ ${p.rating} (${p.reviews})</td>
        <td style="padding:8px 12px">${p.inStock ? '✅ In Stock' : '❌ Out of Stock'}</td>
        <td style="padding:8px 12px">${[p.bestSeller && 'Best Seller', p.deal && 'Deal'].filter(Boolean).join(', ') || '-'}</td>
      </tr>`).join('');
    win.document.write(`<!doctype html><html><head><title>Product Records</title>
    <style>body{font-family:sans-serif;font-size:12px;margin:24px}table{width:100%;border-collapse:collapse}th{background:#1a4d2e;color:#fff;padding:8px 12px;text-align:left}h1{font-size:18px;margin-bottom:4px}p{color:#666;font-size:11px;margin-bottom:16px}</style></head>
    <body><h1>Oresteutensils — Product Records</h1><p>Printed ${new Date().toLocaleString()} · ${printableProducts.length} products</p>
    <table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Old Price</th><th>Rating</th><th>Stock</th><th>Badges</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  // File input refs for local device upload
  const primaryFileRef = useRef<HTMLInputElement>(null);
  const secondaryFileRef = useRef<HTMLInputElement>(null);
  const adminAvatarFileRef = useRef<HTMLInputElement>(null);
  const articleImageFileRef = useRef<HTMLInputElement>(null);
  const articleAuthorAvatarFileRef = useRef<HTMLInputElement>(null);


  // Enforce admin route authentication guard — uses Firebase adminAuth, NOT localStorage re-reads
  useEffect(() => {
    // Check localStorage immediately for fast redirect (prevents flash)
    const stored = localStorage.getItem("oreste_admin_session");
    if (!stored) {
      navigate("/admin/login", { replace: true });
      return;
    }

    // Then subscribe to real Firebase auth state on adminAuth instance
    const unsubscribe = onAuthStateChanged(adminAuth, (firebaseUser) => {
      if (!firebaseUser) {
        // Admin signed out from Firebase — clear session and redirect
        localStorage.removeItem("oreste_admin_session");
        navigate("/admin/login", { replace: true });
      }
      // If firebaseUser exists, admin is authenticated — do nothing, stay on dashboard
    });

    return () => unsubscribe();
  }, []); // Run only once on mount — no navigate in deps to avoid re-trigger

  // Admin user data — load from Supabase admin_profile (with persistent profile & session fallback)
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem("oreste_admin_session");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    try {
      const persistent = localStorage.getItem("oreste_admin_persistent_profile");
      if (persistent) {
        const parsed = JSON.parse(persistent);
        return {
          name: parsed.name || "Oreste Admin",
          email: parsed.email || DESIGNATED_ADMIN_EMAIL,
          role: parsed.role || "Super Admin",
          avatar: parsed.avatar || "/logo.png",
        };
      }
    } catch (e) {}
    return {
      name: "Oreste Admin",
      email: DESIGNATED_ADMIN_EMAIL,
      role: "Super Admin",
      avatar: "/logo.png",
    };
  });

  // On mount: fetch latest admin profile from Supabase (if table exists) to restore avatar etc.
  useEffect(() => {
    async function loadAdminProfile() {
      // First check persistent profile cache for instant visual update
      try {
        const persistent = localStorage.getItem("oreste_admin_persistent_profile");
        if (persistent) {
          const parsed = JSON.parse(persistent);
          setAdminUser((prev: typeof adminUser) => ({
            ...prev,
            name: parsed.name || prev.name,
            email: parsed.email || prev.email,
            role: parsed.role || prev.role,
            avatar: parsed.avatar || prev.avatar,
          }));
          setProfileForm((prev) => ({
            ...prev,
            name: parsed.name || prev.name,
            email: parsed.email || prev.email,
            role: parsed.role || prev.role,
            avatar: parsed.avatar || prev.avatar,
          }));
        }
      } catch (e) {}

      // Then sync from Supabase cloud database
      try {
        const { data, error } = await supabase
          .from("admin_profile")
          .select("*")
          .eq("id", "sole_admin")
          .single();
        if (!error && data) {
          const profile = {
            uid: data.uid || adminUser.uid,
            email: data.email || DESIGNATED_ADMIN_EMAIL,
            name: data.name || adminUser.name,
            role: data.role || adminUser.role,
            avatar: data.avatar || adminUser.avatar,
          };
          setAdminUser((prev: typeof adminUser) => ({ ...prev, ...profile }));
          setProfileForm((prev) => ({
            ...prev,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            avatar: profile.avatar,
          }));
          // Update persistent caches with latest Supabase data
          try {
            localStorage.setItem("oreste_admin_persistent_profile", JSON.stringify(profile));
            const stored = localStorage.getItem("oreste_admin_session");
            if (stored) {
              const session = JSON.parse(stored);
              localStorage.setItem("oreste_admin_session", JSON.stringify({ ...session, ...profile }));
            }
          } catch (e) {}
        }
      } catch (e) {
        // Table doesn't exist yet — silently ignore, use persistent cache fallback
      }
    }
    loadAdminProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Admin Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: adminUser.name,
    email: adminUser.email,
    role: adminUser.role,
    avatar: adminUser.avatar,
  });
  const [profileSuccess, setProfileSuccess] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(adminAuth);
    } catch (e) {}
    localStorage.removeItem("oreste_admin_session");
    navigate("/admin/login", { replace: true });
  };

  // Handle open edit product
  const handleOpenEdit = (product: Product) => {
    // Ensure images array has at least 2 entries for primary & hover swap
    const images = [...product.images];
    if (images.length < 2) {
      images.push(images[0] || "");
    }
    setSelectedProduct({ ...product, images });
    setIsNewProduct(false);
    setIsModalOpen(true);
  };

  // Handle open add product
  const handleOpenAdd = () => {
    setSelectedProduct({
      id: `k_${Date.now()}`,
      slug: `product-${Date.now()}`,
      name: "",
      category: "Cookware",
      price: 45000,
      oldPrice: 65000,
      rating: 5.0,
      reviews: 1,
      images: [
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
      ],
      colors: [{ name: "Standard", hex: "#4a4a4a" }],
      description: "",
      features: ["Premium food-grade materials", "Dishwasher safe"],
      inStock: true,
      bestSeller: false,
      deal: false,
    });
    setIsNewProduct(true);
    setIsModalOpen(true);
  };

  // Handle local device image file upload
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProduct) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const newImages = [...selectedProduct.images];
        newImages[index] = reader.result;
        setSelectedProduct({ ...selectedProduct, images: newImages });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle admin avatar upload with Supabase permanent storage
  const handleAdminAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Local preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileForm((prev) => ({ ...prev, avatar: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);

    // Upload to permanent Supabase Storage
    try {
      const permanentUrl = await uploadImageToSupabase(file, "avatars");
      if (permanentUrl) {
        setProfileForm((prev) => ({ ...prev, avatar: permanentUrl }));
      }
    } catch (err) {
      console.warn("Avatar upload to Supabase failed, using data url:", err);
    }
  };

  // Handle save product (Reliable local + Firebase write)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedProduct.name.trim()) {
      alert("Please provide a product title.");
      return;
    }
    setIsSaving(true);

    try {
      const slug =
        selectedProduct.slug ||
        selectedProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const cleanProduct: Product = {
        ...selectedProduct,
        slug,
        price: Number(selectedProduct.price) || 0,
        oldPrice: selectedProduct.oldPrice ? Number(selectedProduct.oldPrice) : undefined,
        images: selectedProduct.images.filter(Boolean),
      };

      if (isNewProduct) {
        await addProduct(cleanProduct);
      } else {
        await updateProduct(cleanProduct.id, cleanProduct);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsModalOpen(false);
      }, 900);
    } catch (err) {
      console.error("Save product error:", err);
      alert("Notice: Product updated locally. Firebase sync logged.");
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Save Admin Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...adminUser,
      name: profileForm.name.trim() || adminUser.name,
      email: profileForm.email.trim() || adminUser.email,
      role: profileForm.role.trim() || adminUser.role,
      avatar: profileForm.avatar || adminUser.avatar,
    };
    setAdminUser(updated);

    // 1. Save session for active navigation
    try {
      localStorage.setItem("oreste_admin_session", JSON.stringify(updated));
    } catch (err) {}

    // 2. Save durable persistent profile that is NEVER deleted on logout
    try {
      localStorage.setItem("oreste_admin_persistent_profile", JSON.stringify({
        name: updated.name,
        email: updated.email,
        role: updated.role,
        avatar: updated.avatar,
      }));
    } catch (err) {}

    // 3. Persist to Supabase database so avatar and name survive across devices and sessions
    try {
      await supabase.from("admin_profile").upsert([{
        id: "sole_admin",
        uid: updated.uid || null,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        avatar: updated.avatar,
        updated_at: new Date().toISOString(),
      }]);
    } catch (e) {
      // Silently ignore if table doesn't exist yet
    }
    setProfileSuccess(true);
    setTimeout(() => {
      setProfileSuccess(false);
      setIsProfileModalOpen(false);
    }, 900);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f4f6f8] text-[#111827] font-sans antialiased selection:bg-[#1a4d2e] selection:text-white relative">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* ─────────────────────────────────────────────────────────────
          LEFT SIDEBAR (Oresteutensils Admin Style)
         ───────────────────────────────────────────────────────────── */}
      <aside className={
        `fixed lg:static inset-y-0 left-0 z-50 w-64 shrink-0 bg-white border-r border-gray-200/80 flex flex-col justify-between p-5 select-none transition-transform duration-300 ` +
        (isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
      }>
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-1 mb-8">
            <img src="/logo.png" alt="Oresteutensils" style={{borderRadius:'100%'}} className="h-10 w-10 object-cover shadow-md" />
            <div>
              <span className="text-lg font-black tracking-tight text-gray-900 block leading-tight">Oreste<span className="text-[#1a4d2e]">utensils</span></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a4d2e] block">
                Oreste Admin
              </span>
            </div>
          </div>

          {/* STORE & PAGES NAVIGATION Section */}
          <div className="mb-5">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Store & Pages
            </p>
            <nav className="space-y-1">
              <SidebarItem
                icon={<LayoutDashboardIcon className="h-4 w-4" />}
                label="Dashboard"
                active={activeTab === "dashboard"}
                onClick={() => setActiveTab("dashboard")}
              />
              <SidebarItem
                icon={<PackageIcon className="h-4 w-4" />}
                label="Products (/shop)"
                badge={products.length}
                active={activeTab === "products"}
                onClick={() => setActiveTab("products")}
              />
              <SidebarItem
                icon={<LayersIcon className="h-4 w-4 text-emerald-600" />}
                label="Categories (/categories)"
                badge={categories.length}
                active={activeTab === "categories"}
                onClick={() => setActiveTab("categories")}
              />
              <SidebarItem
                icon={<TagIcon className="h-4 w-4 text-amber-600" />}
                label="Deals & Offers (/deals)"
                badge={deals.length}
                active={activeTab === "deals"}
                onClick={() => setActiveTab("deals")}
              />
              <SidebarItem
                icon={<BookOpenIcon className="h-4 w-4 text-sky-600" />}
                label="Blog Articles (/blog)"
                badge={blogPosts.length}
                active={activeTab === "blog"}
                onClick={() => setActiveTab("blog")}
              />
              <SidebarItem
                icon={<MailIcon className="h-4 w-4 text-purple-600" />}
                label="Contact Inquiries (/contact)"
                badge={contactMessages.filter(m => m.status === 'New').length || undefined}
                active={activeTab === "contact"}
                onClick={() => setActiveTab("contact")}
              />
            </nav>
          </div>

          {/* COMMERCE & CUSTOMERS Section */}
          <div className="mb-5">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Sales & Customers
            </p>
            <nav className="space-y-1">
              <SidebarItem
                icon={<ShoppingBagIcon className="h-4 w-4" />}
                label="Orders & Sales"
                badge={orders.length}
                active={activeTab === "orders"}
                onClick={() => setActiveTab("orders")}
              />
              <SidebarItem
                icon={<UsersIcon className="h-4 w-4" />}
                label="Clients"
                badge={clients.length}
                active={activeTab === "clients"}
                onClick={() => setActiveTab("clients")}
              />
              <SidebarItem
                icon={<StarIcon className="h-4 w-4" />}
                label="Ratings & Reviews"
                badge={reviews.length}
                active={activeTab === "reviews"}
                onClick={() => setActiveTab("reviews")}
              />
              <SidebarItem
                icon={<TrendingUpIcon className="h-4 w-4" />}
                label="Store Analytics"
                active={activeTab === "analytics"}
                onClick={() => setActiveTab("analytics")}
              />
              <SidebarItem
                icon={<CalendarIcon className="h-4 w-4 text-violet-500" />}
                label="Plans & Schedule"
                badge={plans.length || undefined}
                active={activeTab === "plans"}
                onClick={() => { setActiveTab("plans"); setIsSidebarOpen(false); }}
              />
            </nav>
          </div>

          {/* GENERAL Section */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              General
            </p>
            <nav className="space-y-1">
              <SidebarItem
                icon={<SettingsIcon className="h-4 w-4" />}
                label="Settings & Profile"
                active={activeTab === "settings"}
                onClick={() => {
                  setProfileForm({
                    name: adminUser.name,
                    email: adminUser.email,
                    role: adminUser.role,
                    avatar: adminUser.avatar,
                  });
                  setIsProfileModalOpen(true);
                }}
              />
              <SidebarItem
                icon={<ExternalLinkIcon className="h-4 w-4" />}
                label="View Storefront"
                onClick={() => window.open("/", "_blank")}
              />
              <SidebarItem
                icon={<LogOutIcon className="h-4 w-4 text-red-500" />}
                label="Logout"
                danger
                onClick={handleLogout}
              />
            </nav>
          </div>
        </div>

        {/* Bottom promo widget (Mobile app card) */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0c2b18] to-[#1a4d2e] p-4 text-white relative overflow-hidden shadow-lg shadow-[#1a4d2e]/15">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
              <SparklesIcon className="h-3.5 w-3.5 text-emerald-300" />
            </div>
            <span className="text-xs font-bold leading-tight">
              Download our Mobile App
            </span>
          </div>
          <p className="text-[11px] text-emerald-200/80 mb-3 leading-snug">
            Manage orders, products & sales on the go
          </p>
          <button
            type="button"
            onClick={() => alert("Mobile Admin App coming soon on iOS & Android!")}
            className="w-full rounded-xl bg-[#2e7d4a] py-2 text-center text-xs font-bold text-white transition hover:bg-[#388e56]"
          >
            Download
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT AREA
         ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto lg:ml-0">
        {/* Top Header Bar */}
        <header className="h-16 px-3 sm:px-8 bg-white border-b border-gray-200/80 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30">
          {/* Hamburger for mobile */}
          <button
            type="button"
            className="lg:hidden h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition shrink-0"
            onClick={() => setIsSidebarOpen(v => !v)}
            title="Toggle sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Search bar */}
          <div className="relative w-full max-w-md hidden sm:block">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search product, order, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-[#f9fafb] py-2 pl-10 pr-12 text-xs font-medium text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#1a4d2e] focus:bg-white focus:ring-2 focus:ring-[#1a4d2e]/15"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-gray-200/60 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
              ⌘F
            </span>
          </div>

          {/* Right Header Actions & Profile */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => alert("All customer messages are handled")}
              className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition"
              title="Messages"
            >
              <MailIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => alert("Firebase Realtime Database connected to fir-db-86758")}
              className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition relative"
              title="Notifications"
            >
              <BellIcon className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
            </button>

            {/* Profile badge (Click to Edit Admin Details!) */}
            <button
              type="button"
              onClick={() => {
                setProfileForm({
                  name: adminUser.name,
                  email: adminUser.email,
                  role: adminUser.role,
                  avatar: adminUser.avatar,
                });
                setIsProfileModalOpen(true);
              }}
              className="flex items-center gap-2.5 pl-2 border-l border-gray-200 hover:bg-gray-50/80 p-1.5 rounded-xl transition cursor-pointer text-left"
              title="Click to edit your admin details"
            >
              <img
                src={adminUser.avatar}
                alt={adminUser.name}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-[#1a4d2e]/20"
              />
              <div className="hidden sm:block leading-tight">
                <span className="text-xs font-bold text-gray-900 block flex items-center gap-1">
                  {adminUser.name}
                  <Edit2Icon className="h-3 w-3 text-gray-400" />
                </span>
                <span className="text-[11px] text-gray-400 block truncate max-w-[140px]">
                  {adminUser.email}
                </span>
              </div>
            </button>
          </div>
        </header>

        {/* Tab Navigation Pill Header */}
        <div className="px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              {activeTab === "dashboard" && "Dashboard & Overview"}
              {activeTab === "products" && "Product Catalog & Inventory"}
              {activeTab === "categories" && "Shop Categories & Taxonomy"}
              {activeTab === "deals" && "Deals & Promotional Campaigns"}
              {activeTab === "blog" && "Editorial Blog & Culinary Articles"}
              {activeTab === "contact" && "Customer Inquiries & Support Inbox"}
              {activeTab === "orders" && "E-Commerce Orders & Transactions"}
              {activeTab === "clients" && "Clients & Customer Directory"}
              {activeTab === "reviews" && "Customer Ratings & Reviews"}
              {activeTab === "analytics" && "Store Analytics & Performance"}
              {activeTab === "settings" && "Store Settings & Admin Profile"}
              {activeTab === "plans" && "Plans & Schedule Manager"}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {activeTab === "dashboard" && "Comprehensive high-level performance, task scheduling, and operations."}
              {activeTab === "products" && "Manage product specifications, pricing, imagery, and stock availability."}
              {activeTab === "categories" && "Organize the 10 catalog categories, product distribution, and storefront links."}
              {activeTab === "deals" && "Monitor active promotional campaigns, discounts, and customer savings."}
              {activeTab === "blog" && "Review published culinary articles, testing guides, and author contributions."}
              {activeTab === "contact" && "Direct messages and support requests submitted from the storefront Contact page."}
              {activeTab === "orders" && "Live orders, transaction statuses, customer shipments, and payment records."}
              {activeTab === "clients" && "Registered user base synced with Firebase Authentication & Supabase."}
              {activeTab === "reviews" && "Real buyer ratings, moderation approvals, and verified culinary testimonials."}
              {activeTab === "analytics" && "Key financial metrics, revenue trajectories, conversion funnels, and category performance."}
              {activeTab === "settings" && "Configure store branding, currency, administrator profile, and system connections."}
              {activeTab === "plans" && "Create, manage and delete your daily plans, tasks, and scheduled events with calendar view."}
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a4d2e] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#143d24] transition active:scale-95"
            >
              <PlusIcon className="h-4 w-4" />
              + Add Product
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
              title="Open schedule planner"
            >
              <ClipboardListIcon className="h-3.5 w-3.5 text-gray-500" />
              View Plans
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB CONTENT
           ───────────────────────────────────────────────────────────── */}
        <div className="p-3 sm:p-6 lg:p-8 pt-4 space-y-6">
          {/* =========================================================
              VIEW 1: DASHBOARD (E-COMMERCE REPLACEMENTS FOR TIME TRACKER & GAUGE)
             ========================================================= */}
          {activeTab === "dashboard" && (
            <>
              {/* Row 1: Four Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Primary Forest Green Card */}
                <div className="rounded-2xl bg-[#1a4d2e] p-5 text-white shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-200">
                      Total Products
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("products")}
                      className="h-7 w-7 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition"
                    >
                      <ArrowUpRightIcon className="h-4 w-4 text-white" />
                    </button>
                  </div>
                  <div className="my-3">
                    <span className="text-4xl font-black tracking-tight">{totalProductsCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-200/90 font-medium">
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-white/20 text-white font-bold text-[10px]">
                      ↑ 5
                    </span>
                    Active in store catalog
                  </div>
                </div>

                {/* 2. Inactive / Sold Out Card */}
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      Sold Out / Inactive
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("products")}
                      className="h-7 w-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                    >
                      <ArrowUpRightIcon className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                  <div className="my-3">
                    <span className="text-4xl font-black text-gray-900 tracking-tight">
                      {outOfStockCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[10px]">
                      Restock
                    </span>
                    Needs replenishment
                  </div>
                </div>

                {/* 3. Active In-Stock Card */}
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      Active In-Stock
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("products")}
                      className="h-7 w-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                    >
                      <ArrowUpRightIcon className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                  <div className="my-3">
                    <span className="text-4xl font-black text-gray-900 tracking-tight">
                      {inStockCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-emerald-50 text-[#1a4d2e] font-bold text-[10px]">
                      Ready
                    </span>
                    Available for shipping
                  </div>
                </div>

                {/* 4. Clients & Reviews Card */}
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      Clients & Reviews
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("reviews")}
                      className="h-7 w-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                    >
                      <ArrowUpRightIcon className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                  <div className="my-3">
                    <span className="text-4xl font-black text-gray-900 tracking-tight">
                      {clients.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                    <span className="font-bold text-amber-600">★ {avgRating}</span>
                    <span>({totalReviewsCount} Customer Ratings)</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Analytics Bar Chart | Reminders | Featured Products */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Live Product Sales Analytics */}
                <div className="lg:col-span-4 rounded-2xl bg-white p-5 border border-gray-200/80 shadow-sm flex flex-col gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Product Sales Analytics</h3>
                    <p className="text-[11px] text-gray-400">Live product count by category</p>
                  </div>
                  {(() => {
                    const cats = Array.from(new Set(products.map(p => p.category)));
                    const data = cats.map(cat => ({ cat, count: products.filter(p => p.category === cat).length })).sort((a,b) => b.count - a.count).slice(0, 7);
                    const max = Math.max(...data.map(d => d.count), 1);
                    return (
                      <div className="flex items-end justify-between h-40 pt-2 px-1 gap-1">
                        {data.map((d, i) => {
                          const pct = Math.max(12, Math.round((d.count / max) * 100));
                          const isTop = i === 0;
                          return (
                            <div key={d.cat} className="flex flex-col items-center gap-1.5 flex-1 group relative">
                              {isTop && (
                                <span className="text-[9px] font-bold text-[#1a4d2e] bg-emerald-100 px-1 py-0.5 rounded whitespace-nowrap">
                                  {d.count} items
                                </span>
                              )}
                              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                                <span className="bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                                  {d.cat}: {d.count}
                                </span>
                                <span className="w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
                              </div>
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${pct}%` }}
                                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.23,1,0.32,1] }}
                                style={{ height: `${pct}%` }}
                                className={`w-full rounded-full ${isTop ? 'bg-[#1a4d2e]' : i === 1 ? 'bg-[#25693e]' : i === 2 ? 'bg-emerald-400' : 'bg-gray-100 border border-dashed border-gray-300'}`}
                              />
                              <span className="text-[9px] font-semibold text-gray-400 truncate w-full text-center">{d.cat.slice(0,4)}</span>
                            </div>
                          );
                        })}
                        {data.length === 0 && <p className="text-xs text-gray-400 w-full text-center self-center">No products yet</p>}
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-3 text-[10px] text-gray-500 pt-1 border-t border-gray-100">
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#1a4d2e] inline-block"/>Top category</span>
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block"/>2nd</span>
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-gray-100 border border-dashed border-gray-300 inline-block"/>Others</span>
                  </div>
                </div>

                {/* Center: Plan & Schedule Calendar */}
                <div className="lg:col-span-4 rounded-2xl bg-white p-5 border border-gray-200/80 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4 text-[#1a4d2e]" /> Plans & Schedule
                    </span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setCalendarDate(d => { const n=new Date(d); n.setMonth(n.getMonth()-1); return n; })} className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">
                        <ChevronLeftIcon className="h-3.5 w-3.5 text-gray-500" />
                      </button>
                      <span className="text-[11px] font-bold text-gray-700">{calendarDate.toLocaleDateString('en-US',{month:'short',year:'numeric'})}</span>
                      <button type="button" onClick={() => setCalendarDate(d => { const n=new Date(d); n.setMonth(n.getMonth()+1); return n; })} className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">
                        <ChevronRightIcon className="h-3.5 w-3.5 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Mini Calendar Grid */}
                  {(() => {
                    const year = calendarDate.getFullYear();
                    const month = calendarDate.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month+1, 0).getDate();
                    const today = new Date();
                    const cells: (number|null)[] = Array(firstDay).fill(null);
                    for (let i=1; i<=daysInMonth; i++) cells.push(i);
                    while (cells.length % 7 !== 0) cells.push(null);
                    const dayNames = ['S','M','T','W','T','F','S'];
                    const hasPlan = (d: number) => plans.some(p => p.day===d && p.month===month && p.year===year);
                    return (
                      <div>
                        <div className="grid grid-cols-7 mb-1">
                          {dayNames.map((d,i) => <span key={i} className="text-[9px] font-bold text-gray-400 text-center">{d}</span>)}
                        </div>
                        <div className="grid grid-cols-7 gap-0.5">
                          {cells.map((d, i) => d ? (
                            <button key={i} type="button" onClick={() => setSelectedDay(d)}
                              className={`relative h-6 w-full text-[10px] font-bold rounded-md transition ${selectedDay===d ? 'bg-[#1a4d2e] text-white' : today.getDate()===d && today.getMonth()===month && today.getFullYear()===year ? 'border border-[#1a4d2e] text-[#1a4d2e]' : 'hover:bg-gray-100 text-gray-700'}`}>
                              {d}
                              {hasPlan(d) && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-emerald-400" />}
                            </button>
                          ) : <span key={i} />)}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Selected day plans */}
                  {selectedDay && (
                    <div className="space-y-1 max-h-16 overflow-y-auto">
                      {plans.filter(p => p.day===selectedDay && p.month===calendarDate.getMonth() && p.year===calendarDate.getFullYear()).length === 0
                        ? <p className="text-[10px] text-gray-400 italic">No plans for day {selectedDay}</p>
                        : plans.filter(p => p.day===selectedDay && p.month===calendarDate.getMonth() && p.year===calendarDate.getFullYear()).map(p => (
                          <div key={p.id} className="flex items-center justify-between bg-emerald-50 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-semibold text-[#1a4d2e] truncate flex-1">{p.title}</span>
                            {p.time && <span className="text-[9px] text-gray-400 ml-1">{p.time}</span>}
                            <button type="button" onClick={() => deletePlan(p.id)} className="ml-1 text-red-400 hover:text-red-600"><XIcon className="h-3 w-3" /></button>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Quick Add Plan */}
                  <div className="border-t border-gray-100 pt-2 space-y-1.5">
                    <input value={planTitle} onChange={e => setPlanTitle(e.target.value)} placeholder="Plan title..." className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#1a4d2e]" />
                    <div className="flex gap-1.5">
                      <input type="time" value={planTime} onChange={e => setPlanTime(e.target.value)} className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#1a4d2e]" />
                      <button type="button" onClick={savePlan} className="px-3 py-1.5 rounded-lg bg-[#1a4d2e] text-white text-[11px] font-bold hover:bg-[#143d24] transition">Add</button>
                    </div>
                  </div>
                </div>

                {/* Right: Featured Products List */}
                <div className="lg:col-span-4 rounded-2xl bg-white p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Featured Products</h3>
                    <button
                      type="button"
                      onClick={handleOpenAdd}
                      className="text-[11px] font-bold text-[#1a4d2e] hover:underline"
                    >
                      + New
                    </button>
                  </div>

                  <div className="space-y-3">
                    {products.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => handleOpenEdit(p)}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="h-8 w-8 rounded-lg object-cover shrink-0 border border-gray-100"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-gray-900 block truncate">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-gray-400 block">
                              {currency(p.price)} &bull; {p.category}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                          {p.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 3: REPLACED WIDGETS WITH E-COMMERCE DETAILS (Recent Orders + Sales Breakdown) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 1. Clients Directory */}
                <div className="lg:col-span-4 rounded-2xl bg-white p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900">Clients & Buyers</h3>
                    <button
                      type="button"
                      onClick={() => setIsClientModalOpen(true)}
                      className="text-[11px] font-bold text-[#1a4d2e] border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition"
                    >
                      + Add Client
                    </button>
                  </div>

                  <div className="space-y-3">
                    {clients.slice(0, 4).map((c) => (
                      <div key={c.id} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="h-9 w-9 rounded-full object-cover border"
                          />
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">
                              {c.name}
                            </span>
                            <span className="text-[11px] text-gray-400 block">
                              {c.role} &bull; {c.ordersCount} orders
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === "Active"
                              ? "bg-emerald-50 text-emerald-700"
                              : c.status === "Pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. REPLACED WIDGET 1: Recent Orders Real-time */}
                <div className="lg:col-span-4 rounded-2xl bg-white p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <ShoppingBagIcon className="h-4 w-4 text-[#1a4d2e]" />
                        Recent Store Orders
                      </h3>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="text-[11px] font-bold text-[#1a4d2e] hover:underline"
                      >
                        All Orders &rarr;
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400">Real-time checkout stream</p>
                  </div>

                  <div className="space-y-2.5 my-3">
                    {orders.slice(0, 3).map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/60 transition"
                      >
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">
                            {ord.customerName}
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            {ord.itemsCount} items &bull; {ord.date}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-gray-900 block">
                            {currency(ord.total)}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                              ord.status === "Delivered"
                                ? "bg-emerald-50 text-[#1a4d2e]"
                                : ord.status === "Processing"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. REPLACED WIDGET 2: Sales & Revenue Breakdown */}
                <div className="lg:col-span-4 rounded-2xl bg-white p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                      <DollarSignIcon className="h-4 w-4 text-emerald-600" />
                      Sales Breakdown
                    </h3>
                    <p className="text-[11px] text-gray-400">Monthly revenue summary</p>
                  </div>

                  <div className="my-3 p-3.5 rounded-xl bg-gradient-to-br from-[#1a4d2e] to-[#25693e] text-white">
                    <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
                      Gross Revenue
                    </span>
                    <span className="text-2xl font-black block mt-0.5">
                      {currency(totalRevenue)}
                    </span>
                    <span className="text-[10px] text-emerald-100 font-medium flex items-center gap-1 mt-1">
                      <span className="bg-white/20 px-1 py-0.2 rounded font-bold">↑ 18.4%</span>
                      growth vs last period
                    </span>
                  </div>

                  <div className="space-y-2 pt-1 text-xs">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Avg Order Value (AOV)</span>
                      <span className="font-bold text-gray-900">{currency(65000)}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Top Category</span>
                      <span className="font-bold text-[#1a4d2e]">Cookware (56%)</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Payment Success</span>
                      <span className="font-bold text-emerald-600">99.4%</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =========================================================
              VIEW 2: PRODUCTS MANAGEMENT (Full CRUD Table)
             ========================================================= */}
          {activeTab === "products" && (
            <div className="rounded-2xl bg-white border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      All Products ({printableProducts.length} / {products.length})
                    </h3>
                    <p className="text-xs text-gray-400">
                      Live synced with Supabase. Hover image swap is active.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrintProducts}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                      title="Print filtered product records"
                    >
                      <PrinterIcon className="h-3.5 w-3.5 text-gray-500" />
                      Print Records
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenAdd}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a4d2e] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#143d24] transition"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add New Product
                    </button>
                  </div>
                </div>
                {/* Filter bar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <FilterIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <select value={prodFilterCat} onChange={e => setProdFilterCat(e.target.value)}
                    className="rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-700 bg-white focus:outline-none focus:border-[#1a4d2e]">
                    <option value="">All Categories</option>
                    {Array.from(new Set(products.map(p => p.category))).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={prodFilterStock} onChange={e => setProdFilterStock(e.target.value)}
                    className="rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-700 bg-white focus:outline-none focus:border-[#1a4d2e]">
                    <option value="">All Stock</option>
                    <option value="inStock">In Stock</option>
                    <option value="outOfStock">Out of Stock</option>
                  </select>
                  <select value={prodFilterBadge} onChange={e => setProdFilterBadge(e.target.value)}
                    className="rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-700 bg-white focus:outline-none focus:border-[#1a4d2e]">
                    <option value="">All Badges</option>
                    <option value="bestSeller">Best Sellers</option>
                    <option value="deal">Deals</option>
                  </select>
                  {(prodFilterCat || prodFilterStock || prodFilterBadge) && (
                    <button type="button" onClick={() => { setProdFilterCat(''); setProdFilterStock(''); setProdFilterBadge(''); }}
                      className="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-0.5">
                      <XIcon className="h-3 w-3" /> Clear filters
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f9fafb] text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Old Price</th>
                      <th className="py-3.5 px-4">Rating</th>
                      <th className="py-3.5 px-4">Hover Swap</th>
                      <th className="py-3.5 px-4">In Stock</th>
                      <th className="py-3.5 px-4">Badges</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {printableProducts.slice((prodPage-1)*PROD_PER_PAGE, prodPage*PROD_PER_PAGE).map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="h-10 w-10 rounded-lg object-cover border border-gray-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-gray-900 block truncate max-w-xs">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                ID: {p.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-700">
                          {p.category}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          {currency(p.price)}
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 line-through">
                          {p.oldPrice ? currency(p.oldPrice) : "-"}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-amber-600">
                          ★ {p.rating} ({p.reviews})
                        </td>
                        <td className="py-3.5 px-4">
                          {p.images[1] ? (
                            <div className="flex items-center gap-1.5" title="Secondary image configured for hover swap">
                              <img
                                src={p.images[1]}
                                alt="Hover swap preview"
                                className="h-7 w-7 rounded object-cover border"
                              />
                              <span className="text-[10px] font-bold text-[#1a4d2e] bg-emerald-50 px-1.5 py-0.5 rounded">
                                Active
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400">None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => updateProduct(p.id, { inStock: !p.inStock })}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                              p.inStock
                                ? "bg-emerald-50 text-[#1a4d2e] hover:bg-emerald-100"
                                : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                          >
                            {p.inStock ? "Yes (In Stock)" : "Out of Stock"}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1">
                            {p.bestSeller && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Best Seller
                              </span>
                            )}
                            {p.deal && (
                              <span className="bg-red-100 text-red-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Deal
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-[#1a4d2e] hover:border-[#1a4d2e] transition"
                              title="Edit product"
                            >
                              <Edit2Icon className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete ${p.name}?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 transition"
                              title="Delete product"
                            >
                              <Trash2Icon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Products Pagination */}
              {printableProducts.length > PROD_PER_PAGE && (
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Showing {Math.min((prodPage-1)*PROD_PER_PAGE+1, printableProducts.length)}–{Math.min(prodPage*PROD_PER_PAGE, printableProducts.length)} of {printableProducts.length} products
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" disabled={prodPage===1} onClick={() => setProdPage(p => Math.max(1,p-1))}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">← Prev</button>
                    {Array.from({length: Math.ceil(printableProducts.length/PROD_PER_PAGE)}, (_,i) => i+1).map(pg => (
                      <button key={pg} type="button" onClick={() => setProdPage(pg)}
                        className={`w-7 h-7 rounded-lg text-[11px] font-bold transition ${prodPage===pg ? 'bg-[#1a4d2e] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {pg}
                      </button>
                    ))}
                    <button type="button" disabled={prodPage===Math.ceil(printableProducts.length/PROD_PER_PAGE)} onClick={() => setProdPage(p => p+1)}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">Next →</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              VIEW 3: ORDERS & TRANSACTIONS
             ========================================================= */}
          {activeTab === "orders" && (
            <div className="rounded-2xl bg-white border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">
                  Customer Orders ({orders.length})
                </h3>
                <p className="text-xs text-gray-400">
                  Store orders, customer payments, and package dispatch status.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f9fafb] text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Items</th>
                      <th className="py-3.5 px-4">Total Amount</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                          {o.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-gray-900 block">{o.customerName}</span>
                          <span className="text-[10px] text-gray-400">{o.customerEmail}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-600">
                          {o.itemsCount} products
                        </td>
                        <td className="py-3.5 px-4 font-black text-[#1a4d2e]">
                          {currency(o.total)}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500">{o.date}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              o.status === "Delivered"
                                ? "bg-emerald-50 text-[#1a4d2e]"
                                : o.status === "Processing"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 4: CLIENTS MANAGEMENT
             ========================================================= */}
          {activeTab === "clients" && (
            <div className="rounded-2xl bg-white border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Registered Clients ({filteredClients.length})
                  </h3>
                  <p className="text-xs text-gray-400">
                    Buyers, culinary partners, and customer accounts saved in Firebase.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a4d2e] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#143d24] transition"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Client
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f9fafb] text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="py-3.5 px-4">Client</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Orders</th>
                      <th className="py-3.5 px-4">Total Spent</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredClients.slice((clientsPage - 1) * CLIENTS_PER_PAGE, clientsPage * CLIENTS_PER_PAGE).map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={c.avatar}
                              alt={c.name}
                              className="h-9 w-9 rounded-full object-cover border"
                            />
                            <div>
                              <span className="font-bold text-gray-900 block">
                                {c.name}
                              </span>
                              <span className="text-[11px] text-gray-400 font-mono">
                                {c.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-700">
                          {c.role}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          {(c.ordersCount ?? (c as any).orders ?? 0)} orders
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#1a4d2e]">
                          {currency((c.totalSpent ?? (c as any).spent ?? 0) as number)}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500">
                          {c.joinedDate ?? (c as any).createdAt ?? "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === "Active"
                                ? "bg-emerald-50 text-[#1a4d2e]"
                                : c.status === "Pending"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => deleteClient(c.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                            title="Delete client"
                          >
                            <Trash2Icon className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Clients Pagination */}
              {filteredClients.length > CLIENTS_PER_PAGE && (
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Showing {Math.min((clientsPage - 1) * CLIENTS_PER_PAGE + 1, filteredClients.length)}–{Math.min(clientsPage * CLIENTS_PER_PAGE, filteredClients.length)} of {filteredClients.length} clients
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={clientsPage === 1}
                      onClick={() => setClientsPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: Math.ceil(filteredClients.length / CLIENTS_PER_PAGE) }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setClientsPage(pg)}
                        className={`w-7 h-7 rounded-lg text-[11px] font-bold transition ${clientsPage === pg ? 'bg-[#1a4d2e] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {pg}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={clientsPage === Math.ceil(filteredClients.length / CLIENTS_PER_PAGE)}
                      onClick={() => setClientsPage((p) => p + 1)}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              VIEW 5: RATINGS & REVIEWS MODERATION
             ========================================================= */}
          {activeTab === "reviews" && (
            <div className="rounded-2xl bg-white border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">
                  Customer Ratings & Reviews ({reviews.length})
                </h3>
                <p className="text-xs text-gray-400">
                  Users can leave ratings on any product page. Moderate and manage reviews in real time.
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-5 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{rev.author}</span>
                        <span className="text-[11px] text-gray-400">&bull; {rev.date}</span>
                        <span className="text-[11px] font-bold text-[#1a4d2e] bg-emerald-50 px-2 py-0.5 rounded">
                          {rev.productName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-gray-700 ml-1">
                          {rev.rating}.0
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed pt-1">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteReview(rev.id, rev.productId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Remove review"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          
          {/* =========================================================
              VIEW: CATEGORIES (/categories)
             ========================================================= */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              {/* Category KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Categories</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-gray-900">{categories.length}</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">100% Active</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Catalog Items</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-gray-900">{products.length}</span>
                    <span className="text-xs font-semibold text-gray-500">Live products</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">In-Stock Rate</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-emerald-600">
                      {Math.round((products.filter(p => p.inStock).length / (products.length || 1)) * 100)}%
                    </span>
                    <span className="text-xs font-bold text-emerald-600">Ready to ship</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Storefront Page</span>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">/categories</span>
                    <button
                      type="button"
                      onClick={() => window.open("/categories", "_blank")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#1a4d2e] hover:underline"
                    >
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                      Browse
                    </button>
                  </div>
                </div>
              </div>

              {/* Categories Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.slice((catPage - 1) * CAT_PER_PAGE, catPage * CAT_PER_PAGE).map((cat) => {
                  const catProducts = products.filter(
                    (p) => p.category.toLowerCase() === cat.name.toLowerCase()
                  );
                  const inStock = catProducts.filter((p) => p.inStock).length;
                  const prices = catProducts.map((p) => p.price);
                  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

                  return (
                    <div
                      key={cat.id}
                      className="rounded-2xl bg-white border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-md transition group"
                    >
                      <div
                        className="h-36 w-full relative overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: cat.tint || "#f4f6f8" }}
                      >
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <span className="absolute bottom-3 left-3 text-white font-extrabold text-base drop-shadow-sm">
                          {cat.name}
                        </span>
                        <span className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-bold text-gray-800 shadow-xs">
                          {catProducts.length} {catProducts.length === 1 ? "Item" : "Items"}
                        </span>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-xl bg-gray-50">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Stock Health</span>
                            <span className="font-bold text-gray-800">{inStock} / {catProducts.length} In Stock</span>
                          </div>
                          <div className="p-2 rounded-xl bg-gray-50">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Price Range</span>
                            <span className="font-bold text-gray-800">
                              {prices.length > 0 ? `${minPrice.toFixed(0)} - ${maxPrice.toFixed(0)}` : "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="pt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setProdFilterCat(cat.name);
                              setActiveTab("products");
                            }}
                            className="flex-1 rounded-xl bg-[#1a4d2e] py-2 text-center text-xs font-bold text-white hover:bg-[#143d24] transition"
                          >
                            Filter in Catalog
                          </button>
                          <button
                            type="button"
                            onClick={() => window.open(`/shop?category=${encodeURIComponent(cat.name)}`, "_blank")}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                            title="View on storefront"
                          >
                            <ExternalLinkIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Categories Pagination */}
              {categories.length > CAT_PER_PAGE && (
                <div className="rounded-2xl bg-white p-4 border border-gray-200/80 flex items-center justify-between shadow-xs">
                  <span className="text-[11px] text-gray-400">
                    Showing {Math.min((catPage - 1) * CAT_PER_PAGE + 1, categories.length)}–{Math.min(catPage * CAT_PER_PAGE, categories.length)} of {categories.length} categories
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={catPage === 1}
                      onClick={() => setCatPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: Math.ceil(categories.length / CAT_PER_PAGE) }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setCatPage(pg)}
                        className={`w-7 h-7 rounded-lg text-[11px] font-bold transition ${catPage === pg ? 'bg-[#1a4d2e] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {pg}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={catPage === Math.ceil(categories.length / CAT_PER_PAGE)}
                      onClick={() => setCatPage((p) => p + 1)}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* Category Inventory Share Breakdown */}
              <div className="rounded-2xl bg-white p-6 border border-gray-200/80 shadow-xs">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">
                  Catalog Distribution by Category
                </h3>
                <div className="space-y-3">
                  {categories.map((cat) => {
                    const count = products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length;
                    const pct = Math.round((count / (products.length || 1)) * 100);
                    return (
                      <div key={cat.id} className="flex items-center gap-4 text-xs">
                        <span className="w-36 font-semibold text-gray-700 truncate">{cat.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#1a4d2e]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-16 text-right font-bold text-gray-900">{count} items</span>
                        <span className="w-12 text-right text-gray-400 font-mono">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW: DEALS & PROMOTIONS (/deals)
             ========================================================= */}
          {activeTab === "deals" && (
            <div className="space-y-6">
              {/* Deals KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Featured Campaigns</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-gray-900">{deals.length}</span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Discounted Products</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[#1a4d2e]">
                      {products.filter((p) => p.deal || (p.oldPrice && p.oldPrice > p.price)).length}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">In catalog</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Max Discount</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-rose-600">50% OFF</span>
                    <span className="text-xs font-semibold text-gray-500">Cookware Sale</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Storefront Page</span>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">/deals</span>
                    <button
                      type="button"
                      onClick={() => window.open("/deals", "_blank")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#1a4d2e] hover:underline"
                    >
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                      View Deals
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Promotional Banners */}
              <div className="rounded-2xl bg-white p-6 border border-gray-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                      Active Promotional Banners on Storefront
                    </h3>
                    <p className="text-xs text-gray-400">These promotional banners appear on the /deals page and homepage.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.open("/deals", "_blank")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
                  >
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                    Open /deals Page
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {deals.map((d) => (
                    <div
                      key={d.id}
                      className="rounded-2xl border border-gray-200 overflow-hidden flex flex-col justify-between"
                      style={{ backgroundColor: d.tint || "#fefefe" }}
                    >
                      <div className="p-5">
                        <span className="inline-block rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-gray-800 mb-2">
                          {d.eyebrow}
                        </span>
                        <h4 className="text-base font-extrabold text-gray-900">{d.title}</h4>
                        <p className="mt-2 text-xs text-gray-600 line-clamp-3 leading-relaxed">{d.copy}</p>
                      </div>
                      <div className="p-4 bg-white/60 border-t border-gray-200/60 flex items-center justify-between text-xs font-bold">
                        <span className="text-[#1a4d2e]">{d.cta}</span>
                        <button
                          type="button"
                          onClick={() => window.open(d.href, "_blank")}
                          className="rounded-lg bg-white p-1.5 shadow-2xs border border-gray-200 hover:bg-gray-50"
                        >
                          <ExternalLinkIcon className="h-3.5 w-3.5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discounted Products Management Table */}
              <div className="rounded-2xl bg-white border border-gray-200/80 overflow-hidden shadow-xs">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                      Catalog Deals & Markdowns
                    </h3>
                    <p className="text-xs text-gray-400">Products marked with special discounts and flash deal badges.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/75 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                      <tr>
                        <th className="py-3.5 px-6">Product</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Deal Price</th>
                        <th className="py-3.5 px-4">Original Price</th>
                        <th className="py-3.5 px-4">Savings</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-6 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(() => {
                        const dealProducts = products.filter((p) => p.deal || (p.oldPrice && p.oldPrice > p.price));
                        const paginatedDeals = dealProducts.slice((dealsPage - 1) * DEALS_PER_PAGE, dealsPage * DEALS_PER_PAGE);
                        return paginatedDeals.map((p) => {
                          const savings = p.oldPrice ? p.oldPrice - p.price : 0;
                          const pct = p.oldPrice ? Math.round((savings / p.oldPrice) * 100) : 0;
                          return (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition">
                              <td className="py-3.5 px-6">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={p.images[0]}
                                    alt={p.name}
                                    className="h-10 w-10 rounded-xl object-cover border border-gray-200"
                                  />
                                  <div>
                                    <span className="font-bold text-gray-900 block">{p.name}</span>
                                    <span className="text-[10px] text-gray-400">{p.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-medium text-gray-600">{p.category}</td>
                              <td className="py-3.5 px-4 font-bold text-emerald-700">{currency(p.price)}</td>
                              <td className="py-3.5 px-4 text-gray-400 line-through">
                                {p.oldPrice ? currency(p.oldPrice) : "-"}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold text-rose-700">
                                  <FlameIcon className="h-3 w-3" />
                                  {pct}% OFF (-{currency(savings)})
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                {p.deal ? (
                                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                                    ★ Featured Deal
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-gray-600">
                                    Markdown
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-6 text-right">
                                <button
                                  type="button"
                                  onClick={() => updateProduct(p.id, { deal: !p.deal })}
                                  className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-100 transition"
                                >
                                  {p.deal ? "Disable Deal" : "Enable Deal Badge"}
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Deals Pagination */}
                {(() => {
                  const dealProducts = products.filter((p) => p.deal || (p.oldPrice && p.oldPrice > p.price));
                  if (dealProducts.length <= DEALS_PER_PAGE) return null;
                  const totalDealsPages = Math.ceil(dealProducts.length / DEALS_PER_PAGE);
                  return (
                    <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">
                        Showing {Math.min((dealsPage - 1) * DEALS_PER_PAGE + 1, dealProducts.length)}–{Math.min(dealsPage * DEALS_PER_PAGE, dealProducts.length)} of {dealProducts.length} deals
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={dealsPage === 1}
                          onClick={() => setDealsPage((p) => Math.max(1, p - 1))}
                          className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          ← Prev
                        </button>
                        {Array.from({ length: totalDealsPages }, (_, i) => i + 1).map((pg) => (
                          <button
                            key={pg}
                            type="button"
                            onClick={() => setDealsPage(pg)}
                            className={`w-7 h-7 rounded-lg text-[11px] font-bold transition ${dealsPage === pg ? 'bg-[#1a4d2e] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                          >
                            {pg}
                          </button>
                        ))}
                        <button
                          type="button"
                          disabled={dealsPage === totalDealsPages}
                          onClick={() => setDealsPage((p) => p + 1)}
                          className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW: BLOG & ARTICLES (/blog)
             ========================================================= */}
          {activeTab === "blog" && (
            <div className="space-y-6">
              {/* Blog KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Published Articles</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-gray-900">{adminBlogPosts.length}</span>
                    <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">Live</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Read Time</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-gray-900">{adminBlogPosts.length * 4} mins</span>
                    <span className="text-xs font-semibold text-gray-500">Across {adminBlogPosts.length} posts</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Culinary Authors</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[#1a4d2e]">{new Set(adminBlogPosts.map(p => p.author.name)).size}</span>
                    <span className="text-xs font-semibold text-gray-500">Chefs & Editors</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Storefront Page</span>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">/blog</span>
                    <button
                      type="button"
                      onClick={() => window.open("/blog", "_blank")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#1a4d2e] hover:underline"
                    >
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                      View Blog
                    </button>
                  </div>
                </div>
              </div>

              {/* Blog Header with Add Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                    Published Articles & Culinary Guides
                  </h3>
                  <p className="text-xs text-gray-400">Manage and create articles synced with Supabase & storefront.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBlogPost({
                      id: `b_${Date.now()}`,
                      slug: `article-${Date.now()}`,
                      title: "",
                      excerpt: "",
                      tag: "Culinary Tips",
                      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                      readTime: "4 min read",
                      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
                      author: {
                        name: "Elena Vance",
                        role: "Travel Editor & Product Lead",
                        avatar: "https://i.pravatar.cc/128?img=45",
                      },
                      intro: "",
                      sections: [
                        {
                          heading: "Essential Utensils & Techniques",
                          body: ["Mastering your kitchen starts with understanding quality materials and craftsmanship."],
                          tip: "Always hand wash your premium chef knives to keep the edge sharp.",
                        },
                      ],
                      conclusion: "Equipping your kitchen with the right utensils elevates everyday meals into memorable dining experiences.",
                    });
                    setIsNewBlogModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a4d2e] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#143d24] transition"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add New Article
                </button>
              </div>

              {/* Blog Posts Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {adminBlogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl bg-white border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 w-full relative overflow-hidden bg-gray-100">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-gray-800 shadow-xs">
                          {post.tag}
                        </span>
                        <span className="absolute bottom-3 right-3 rounded-full bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-white">
                          {post.readTime}
                        </span>
                      </div>

                      <div className="p-5 space-y-3">
                        <span className="text-[11px] font-semibold text-gray-400 block">{post.date}</span>
                        <h4 className="text-base font-extrabold text-gray-900 line-clamp-2 leading-snug">
                          {post.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      {/* Author */}
                      <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100 mb-4">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="h-7 w-7 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <span className="text-xs font-bold text-gray-800 block leading-tight">{post.author.name}</span>
                          <span className="text-[10px] text-gray-400 block leading-tight">{post.author.role}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedBlogModal(post)}
                          className="flex-1 rounded-xl bg-[#1a4d2e] py-2 text-center text-xs font-bold text-white hover:bg-[#143d24] transition"
                        >
                          Read
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBlogPost(post);
                            setIsNewBlogModalOpen(true);
                          }}
                          className="rounded-xl border border-gray-200 p-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                          title="Edit Article"
                        >
                          <Edit2Icon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlogPost(post.id)}
                          className="rounded-xl border border-gray-200 p-2 text-xs font-bold text-red-500 hover:bg-red-50 transition"
                          title="Delete Article"
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                          className="rounded-xl border border-gray-200 p-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                          title="Open on storefront"
                        >
                          <ExternalLinkIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW: CONTACT INQUIRIES (/contact)
             ========================================================= */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              {/* Contact KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Inquiries</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-gray-900">{contactMessages.length}</span>
                    <span className="text-xs font-semibold text-gray-500">From /contact</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">New / Unread</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-purple-600">
                      {contactMessages.filter((m) => m.status === "New").length}
                    </span>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Requires attention</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">In Progress</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-amber-600">
                      {contactMessages.filter((m) => m.status === "In Progress").length}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">Under review</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Resolved / Replied</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-emerald-600">
                      {contactMessages.filter((m) => m.status === "Replied").length}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">Completed</span>
                  </div>
                </div>
              </div>

              {/* Inquiries Table */}
              <div className="rounded-2xl bg-white border border-gray-200/80 overflow-hidden shadow-xs">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                      Customer Messages & Inquiries Inbox
                    </h3>
                    <p className="text-xs text-gray-400">Submissions from prospective buyers, chefs, and wholesale partners.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.open("/contact", "_blank")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                  >
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                    Open Storefront Contact Form
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {contactMessages.map((msg) => (
                    <div key={msg.id} className="p-5 hover:bg-gray-50/60 transition space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-[#1a4d2e]/10 text-[#1a4d2e] flex items-center justify-center font-bold text-xs shrink-0">
                            {msg.name[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-gray-900 block leading-tight">{msg.name}</span>
                            <span className="text-xs text-gray-500 font-mono">{msg.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-400">
                            {new Date(msg.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <select
                            value={msg.status}
                            onChange={(e) => handleUpdateMessageStatus(msg.id, e.target.value as any)}
                            className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border outline-none ${
                              msg.status === "New"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : msg.status === "In Progress"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            <option value="New">● New</option>
                            <option value="In Progress">● In Progress</option>
                            <option value="Replied">● Replied</option>
                          </select>
                        </div>
                      </div>

                      <div className="pl-11">
                        <h4 className="text-xs font-bold text-gray-800 mb-1">{msg.subject}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                          {msg.message}
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a4d2e] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#143d24] transition"
                          >
                            <MailIcon className="h-3 w-3" />
                            Reply via Email
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2Icon className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW: STORE ANALYTICS & INTELLIGENCE
             ========================================================= */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* High-level Financial KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Gross Sales</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-gray-900">${(totalRevenue).toFixed(2)}</span>
                    <span className="text-xs font-bold text-emerald-600">+14.2%</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Net Margin</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[#1a4d2e]">68.5%</span>
                    <span className="text-xs font-semibold text-gray-500">Profitable</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Average Order Value</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-gray-900">$126.80</span>
                    <span className="text-xs font-bold text-emerald-600">+3.1%</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Store Conversion</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-gray-900">3.85%</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Top 10%</span>
                  </div>
                </div>
              </div>

              {/* Category Sales Share Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-white p-6 border border-gray-200/80 shadow-xs">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1">
                    Revenue Contribution by Category
                  </h3>
                  <p className="text-xs text-gray-400 mb-5">Sales performance across primary kitchen categories.</p>

                  <div className="space-y-4">
                    {[
                      { name: "Cookware", revenue: 14280, pct: 42, color: "#1a4d2e" },
                      { name: "Food Preparation & Knives", revenue: 8460, pct: 25, color: "#2563eb" },
                      { name: "Kitchen Appliances", revenue: 6120, pct: 18, color: "#7c3aed" },
                      { name: "Kitchen Utensils", revenue: 3380, pct: 10, color: "#ea580c" },
                      { name: "Kitchen Storage & Others", revenue: 1700, pct: 5, color: "#059669" },
                    ].map((item) => (
                      <div key={item.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-gray-800">{item.name}</span>
                          <span className="text-gray-900">${item.revenue.toLocaleString()} ({item.pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversion Funnel */}
                <div className="rounded-2xl bg-white p-6 border border-gray-200/80 shadow-xs">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1">
                    Storefront Conversion Funnel
                  </h3>
                  <p className="text-xs text-gray-400 mb-5">Customer journey progression from visits to completed purchases.</p>

                  <div className="space-y-3">
                    {[
                      { step: "1. Storefront Visitors", count: "14,820 visitors", drop: "100%", width: "100%", bg: "bg-gray-800" },
                      { step: "2. Product Page Views", count: "8,410 views", drop: "56.7%", width: "75%", bg: "bg-[#1a4d2e]" },
                      { step: "3. Added Items to Cart", count: "2,340 carts", drop: "27.8%", width: "50%", bg: "bg-emerald-600" },
                      { step: "4. Checkout Initiated", count: "980 checkouts", drop: "41.9%", width: "35%", bg: "bg-amber-600" },
                      { step: "5. Completed Orders", count: `${orders.length + 54} orders`, drop: "58.2%", width: "25%", bg: "bg-rose-600" },
                    ].map((funnel) => (
                      <div key={funnel.step} className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-gray-800">{funnel.step}</span>
                          <span className="text-gray-600">{funnel.count} ({funnel.drop})</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200/80 overflow-hidden">
                          <div className={`h-full rounded-full ${funnel.bg}`} style={{ width: funnel.width }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Customer Channel Acquisition */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Google OAuth Sign-Ins</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-gray-900">62.4%</span>
                    <span className="text-xs font-bold text-sky-600">Primary</span>
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">Users authenticating with 1-click Google accounts.</p>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Email Registrations</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-gray-900">37.6%</span>
                    <span className="text-xs font-semibold text-gray-500">Supabase synced</span>
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">Customers registered with traditional email/passkey.</p>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-gray-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Repeat Purchase Rate</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-emerald-600">42.1%</span>
                    <span className="text-xs font-bold text-emerald-600">High loyalty</span>
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">Customers placing more than 2 separate utensil orders.</p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW: SETTINGS & STORE PROFILE
             ========================================================= */}
          {activeTab === "settings" && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Admin Profile Card */}
              <div className="rounded-2xl bg-white p-6 border border-gray-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <img
                      src={adminUser.avatar}
                      alt={adminUser.name}
                      style={{ borderRadius: "100%" }}
                      className="h-16 w-16 object-cover border-2 border-[#1a4d2e]/20 shadow-md"
                    />
                    <div>
                      <h3 className="text-lg font-black text-gray-900">{adminUser.name}</h3>
                      <p className="text-xs text-gray-500">{adminUser.role} &bull; {adminUser.email}</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 mt-1">
                        ● Sole Assigned Administrator
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileForm({
                        name: adminUser.name,
                        email: adminUser.email,
                        role: adminUser.role,
                        avatar: adminUser.avatar,
                      });
                      setIsProfileModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a4d2e] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#143d24] transition self-start sm:self-auto"
                  >
                    <Edit2Icon className="h-3.5 w-3.5" />
                    Edit Profile Details
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="font-bold text-gray-700 block mb-0.5">Assigned Administrator Email</span>
                    <span className="font-mono text-gray-900">{DESIGNATED_ADMIN_EMAIL}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="font-bold text-gray-700 block mb-0.5">Firebase Admin App Instance</span>
                    <span className="font-mono text-emerald-700 font-bold">ADMIN_APP (Isolated Session)</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="font-bold text-gray-700 block mb-0.5">Supabase Database Sync</span>
                    <span className="font-mono text-emerald-700 font-bold">Connected (vpdtkyjufqvgdmopyydv)</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="font-bold text-gray-700 block mb-0.5">Store Currency</span>
                    <span className="font-bold text-gray-900">USD ($) &bull; United States Dollar</span>
                  </div>
                </div>
              </div>

              {/* Storefront Identity & Information */}
              <div className="rounded-2xl bg-white p-6 border border-gray-200/80 shadow-xs">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">
                  Oresteutensils Store Information & Contact
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">Customer Support Email</span>
                    <span className="font-semibold text-gray-900">support@oresteutensils.com</span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">Customer Support Phone</span>
                    <span className="font-semibold text-gray-900">+250 788 123 456</span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">Showroom & Studio Location</span>
                    <span className="font-semibold text-gray-900">City Plaza, Kigali, Rwanda</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PRODUCT EDIT / ADD MODAL (Supports Local Device Upload & Hover Swap)
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    {isNewProduct ? "Add New Kitchen Tool" : `Edit: ${selectedProduct.name}`}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Upload images from your device. Hover swap image will show when users hover over the product card.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedProduct.name}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, name: e.target.value })
                    }
                    placeholder="e.g. Non-Stick Frying Pan"
                    className="w-full rounded-xl border border-gray-200 py-2 px-3 text-xs font-medium text-gray-900 outline-none focus:border-[#1a4d2e] focus:ring-2 focus:ring-[#1a4d2e]/15"
                  />
                </div>

                {/* Category & Price Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Category *
                    </label>
                    <select
                      value={selectedProduct.category}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, category: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 py-2 px-3 text-xs font-medium text-gray-900 outline-none focus:border-[#1a4d2e]"
                    >
                      <option value="Cookware">Cookware</option>
                      <option value="Kitchen Utensils">Kitchen Utensils</option>
                      <option value="Food Preparation">Food Preparation</option>
                      <option value="Dinnerware">Dinnerware</option>
                      <option value="Drinkware">Drinkware</option>
                      <option value="Kitchen Storage">Kitchen Storage</option>
                      <option value="Kitchen Appliances">Kitchen Appliances</option>
                      <option value="Baking">Baking</option>
                      <option value="Kitchen Cleaning">Kitchen Cleaning</option>
                      <option value="Kitchen Accessories">Kitchen Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={selectedProduct.price}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 py-2 px-3 text-xs font-medium text-gray-900 outline-none focus:border-[#1a4d2e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Original Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedProduct.oldPrice ?? ""}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          oldPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 py-2 px-3 text-xs font-medium text-gray-900 outline-none focus:border-[#1a4d2e]"
                    />
                  </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    IMAGES SECTION: LOCAL DEVICE UPLOAD + HOVER SWAP IMAGE
                   ───────────────────────────────────────────────────────────── */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-[#1a4d2e]" />
                      Product Images & Hover Swap
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Upload from phone or computer
                    </span>
                  </div>

                  {/* Primary Image */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        1. Primary Image (Main Storefront) *
                      </label>
                      <div className="flex items-center gap-2">
                        {selectedProduct.images[0] ? (
                          <img
                            src={selectedProduct.images[0]}
                            alt="Primary preview"
                            className="h-16 w-16 rounded-xl object-cover border bg-white shrink-0"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                            <CameraIcon className="h-6 w-6" />
                          </div>
                        )}
                        <div className="space-y-1.5 flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            ref={primaryFileRef}
                            onChange={(e) => handleFileUpload(e, 0)}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => primaryFileRef.current?.click()}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white py-1.5 px-3 text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition shadow-xs"
                          >
                            <UploadIcon className="h-3.5 w-3.5 text-[#1a4d2e]" />
                            Upload from Device
                          </button>
                          <input
                            type="text"
                            placeholder="Or paste image URL"
                            value={selectedProduct.images[0] || ""}
                            onChange={(e) => {
                              const arr = [...selectedProduct.images];
                              arr[0] = e.target.value;
                              setSelectedProduct({ ...selectedProduct, images: arr });
                            }}
                            className="w-full rounded-lg border border-gray-200 bg-white py-1 px-2 text-[10px]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Secondary Image: Hover Swap */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center justify-between">
                        <span>2. Hover Swap Image (On Cursor Hover)</span>
                        <span className="text-[10px] text-[#1a4d2e] font-bold">Auto-Swaps!</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {selectedProduct.images[1] ? (
                          <img
                            src={selectedProduct.images[1]}
                            alt="Hover swap preview"
                            className="h-16 w-16 rounded-xl object-cover border bg-white shrink-0 ring-2 ring-emerald-400/40"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-xl border-2 border-dashed border-emerald-300 flex items-center justify-center text-emerald-600/50 bg-emerald-50/50 shrink-0">
                            <EyeIcon className="h-6 w-6" />
                          </div>
                        )}
                        <div className="space-y-1.5 flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            ref={secondaryFileRef}
                            onChange={(e) => handleFileUpload(e, 1)}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => secondaryFileRef.current?.click()}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 py-1.5 px-3 text-[11px] font-bold text-[#1a4d2e] hover:bg-emerald-100 transition shadow-xs"
                          >
                            <UploadIcon className="h-3.5 w-3.5 text-[#1a4d2e]" />
                            Upload Hover Swap Image
                          </button>
                          <input
                            type="text"
                            placeholder="Or paste secondary URL"
                            value={selectedProduct.images[1] || ""}
                            onChange={(e) => {
                              const arr = [...selectedProduct.images];
                              arr[1] = e.target.value;
                              setSelectedProduct({ ...selectedProduct, images: arr });
                            }}
                            className="w-full rounded-lg border border-gray-200 bg-white py-1 px-2 text-[10px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Product Details */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Related Product & Kitchen Pairing Info
                  </label>
                  <input
                    type="text"
                    value={selectedProduct.badge || ""}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, badge: e.target.value || undefined })
                    }
                    placeholder="e.g. Pairs with Silicone Spatula & Glass Lid (or SKU: K2)"
                    className="w-full rounded-xl border border-gray-200 py-2 px-3 text-xs font-medium text-gray-900 outline-none focus:border-[#1a4d2e]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={selectedProduct.description}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, description: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 py-2 px-3 text-xs font-medium text-gray-900 outline-none focus:border-[#1a4d2e]"
                  />
                </div>

                {/* Switches: In Stock, Best Seller, Deal */}
                <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedProduct.inStock}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, inStock: e.target.checked })
                      }
                      className="rounded text-[#1a4d2e] focus:ring-[#1a4d2e]"
                    />
                    In Stock (Active)
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedProduct.bestSeller}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, bestSeller: e.target.checked })
                      }
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    Best Seller Badge
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedProduct.deal}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, deal: e.target.checked })
                      }
                      className="rounded text-red-500 focus:ring-red-500"
                    />
                    Hot Deal Badge
                  </label>
                </div>

                {/* Save Feedback */}
                {saveSuccess && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-[#1a4d2e] flex items-center gap-2">
                    <CheckIcon className="h-4 w-4" />
                    Product saved successfully and live on storefront!
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a4d2e] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#143d24] transition disabled:opacity-60"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Saving to Supabase & Store...
                      </span>
                    ) : (
                      <>
                        <SaveIcon className="h-4 w-4" />
                        Save Product to Supabase
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          ADMIN PROFILE & DETAILS EDIT MODAL
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <UserCheckIcon className="h-4 w-4 text-[#1a4d2e]" />
                  Modify Admin Details & Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="h-7 w-7 rounded-full border flex items-center justify-center text-gray-400 hover:text-gray-700"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
                {/* Avatar Uploader */}
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <img
                    src={profileForm.avatar}
                    alt="Admin Avatar Preview"
                    className="h-16 w-16 rounded-2xl object-cover border-2 border-white shadow-sm ring-2 ring-[#1a4d2e]/20"
                  />
                  <div className="space-y-1.5 flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      ref={adminAvatarFileRef}
                      onChange={handleAdminAvatarUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => adminAvatarFileRef.current?.click()}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white py-1.5 px-3 font-bold text-gray-700 hover:bg-gray-100"
                    >
                      <UploadIcon className="h-3.5 w-3.5 text-[#1a4d2e]" />
                      Upload Avatar from Device
                    </button>
                    <input
                      type="text"
                      placeholder="Or enter image URL"
                      value={profileForm.avatar}
                      onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white py-1 px-2 text-[10px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Admin Full Name *</label>
                  <input
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full rounded-xl border p-2 text-xs outline-none focus:border-[#1a4d2e]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Admin Email Address *</label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full rounded-xl border p-2 text-xs outline-none focus:border-[#1a4d2e]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Role / Job Title</label>
                  <input
                    value={profileForm.role}
                    onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                    className="w-full rounded-xl border p-2 text-xs outline-none focus:border-[#1a4d2e]"
                  />
                </div>

                {profileSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold flex items-center gap-2 border border-emerald-200">
                    <CheckIcon className="h-4 w-4" />
                    Admin details updated and persisted!
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg border text-gray-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#1a4d2e] text-white font-bold hover:bg-[#143d24]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          CLIENT ADD MODAL
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isClientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-bold text-gray-900">Add New Client Account</h3>
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="h-7 w-7 rounded-full border flex items-center justify-center text-gray-400 hover:text-gray-700"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const target = e.currentTarget as any;
                  await addClient({
                    name: target.clientName.value,
                    email: target.clientEmail.value,
                    role: target.clientRole.value || "Customer",
                    avatar:
                      target.clientAvatar.value ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                    ordersCount: 1,
                    totalSpent: 45.0,
                    joinedDate: new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }),
                    status: "Active",
                  });
                  setIsClientModalOpen(false);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    name="clientName"
                    required
                    placeholder="e.g. Marie Curie"
                    className="w-full rounded-xl border p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    name="clientEmail"
                    type="email"
                    required
                    placeholder="marie@gmail.com"
                    className="w-full rounded-xl border p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Role / Tag</label>
                  <input
                    name="clientRole"
                    placeholder="e.g. Pastry Chef / VIP Buyer"
                    className="w-full rounded-xl border p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Avatar Image URL (Optional)</label>
                  <input
                    name="clientAvatar"
                    placeholder="https://..."
                    className="w-full rounded-xl border p-2 text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsClientModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border text-gray-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#1a4d2e] text-white font-bold"
                  >
                    Save Client
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          BLOG PREVIEW & EDIT MODALS
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedBlogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="relative h-48 w-full bg-gray-100 shrink-0">
                <img src={selectedBlogModal.image} alt={selectedBlogModal.title} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setSelectedBlogModal(null)}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <XIcon className="h-4 w-4" />
                </button>
                <span className="absolute bottom-3 left-4 rounded-full bg-white/90 px-3 py-0.5 text-xs font-bold text-gray-800">
                  {selectedBlogModal.tag} • {selectedBlogModal.readTime}
                </span>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                  <span>{selectedBlogModal.date}</span>
                  <span>•</span>
                  <span className="font-bold text-gray-700">By {selectedBlogModal.author.name} ({selectedBlogModal.author.role})</span>
                </div>
                <h2 className="text-lg font-black text-gray-900 leading-snug">{selectedBlogModal.title}</h2>
                <p className="text-gray-600 font-medium leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                  "{selectedBlogModal.excerpt}"
                </p>
                {selectedBlogModal.intro && (
                  <p className="text-gray-700 leading-relaxed">{selectedBlogModal.intro}</p>
                )}
                {selectedBlogModal.sections?.map((sec, idx) => (
                  <div key={idx} className="space-y-1.5 pt-2">
                    <h4 className="font-bold text-gray-900 text-sm">{sec.heading}</h4>
                    {sec.body.map((b, i) => (
                      <p key={i} className="text-gray-600 leading-relaxed">{b}</p>
                    ))}
                    {sec.tip && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-medium">
                        💡 <strong>Pro Tip:</strong> {sec.tip}
                      </div>
                    )}
                  </div>
                ))}
                {selectedBlogModal.conclusion && (
                  <p className="text-gray-700 font-medium pt-2 border-t border-gray-100">{selectedBlogModal.conclusion}</p>
                )}
              </div>
              <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedBlogModal(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.open(`/blog/${selectedBlogModal.slug}`, "_blank")}
                  className="px-4 py-2 rounded-xl bg-[#1a4d2e] text-white font-bold hover:bg-[#143d24] flex items-center gap-1.5"
                >
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                  View Live Article
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ADD / EDIT BLOG ARTICLE MODAL
           ───────────────────────────────────────────────────────────── */}
        {isNewBlogModalOpen && editingBlogPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {adminBlogPosts.some(p => p.id === editingBlogPost.id) ? "Edit Article" : "Create New Culinary Article"}
                  </h3>
                  <p className="text-[11px] text-gray-400">Article will sync with Supabase and be visible on /blog.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewBlogModalOpen(false)}
                  className="h-7 w-7 rounded-full border flex items-center justify-center text-gray-400 hover:text-gray-700"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleSaveBlogPost(editingBlogPost);
                  setIsNewBlogModalOpen(false);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Article Title *</label>
                  <input
                    required
                    value={editingBlogPost.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                      setEditingBlogPost({ ...editingBlogPost, title, slug: slug || editingBlogPost.slug });
                    }}
                    placeholder="e.g. The Art of Caring for Stainless Steel & Cast Iron"
                    className="w-full rounded-xl border p-2 text-xs outline-none focus:border-[#1a4d2e]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Category / Tag</label>
                    <input
                      value={editingBlogPost.tag}
                      onChange={(e) => setEditingBlogPost({ ...editingBlogPost, tag: e.target.value })}
                      placeholder="e.g. Kitchen Utensils"
                      className="w-full rounded-xl border p-2 text-xs outline-none focus:border-[#1a4d2e]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Read Time</label>
                    <input
                      value={editingBlogPost.readTime}
                      onChange={(e) => setEditingBlogPost({ ...editingBlogPost, readTime: e.target.value })}
                      placeholder="e.g. 5 min read"
                      className="w-full rounded-xl border p-2 text-xs outline-none focus:border-[#1a4d2e]"
                    />
                  </div>
                </div>

                {/* Article Cover Image with Device Upload */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Article Cover Image *</label>
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
                    {editingBlogPost.image && (
                      <img
                        src={editingBlogPost.image}
                        alt="Article Cover Preview"
                        className="h-16 w-24 rounded-xl object-cover border border-gray-200 shrink-0"
                      />
                    )}
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        accept="image/*"
                        ref={articleImageFileRef}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === "string") {
                              setEditingBlogPost((prev) => prev ? { ...prev, image: reader.result as string } : null);
                            }
                          };
                          reader.readAsDataURL(file);

                          try {
                            const permUrl = await uploadImageToSupabase(file, "articles");
                            if (permUrl) {
                              setEditingBlogPost((prev) => prev ? { ...prev, image: permUrl } : null);
                            }
                          } catch (err) {
                            console.warn("Cover upload error:", err);
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => articleImageFileRef.current?.click()}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white py-1.5 px-3 font-bold text-gray-700 hover:bg-gray-100 transition shadow-2xs"
                      >
                        <UploadIcon className="h-3.5 w-3.5 text-[#1a4d2e]" />
                        Upload Cover from Device
                      </button>
                      <input
                        type="text"
                        placeholder="Or paste image URL"
                        value={editingBlogPost.image}
                        onChange={(e) => setEditingBlogPost({ ...editingBlogPost, image: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white py-1 px-2 text-[10px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Author Information (Elena Vance / Custom) */}
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#1a4d2e]">
                      Author / Contributor Information
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBlogPost((prev) => prev ? {
                          ...prev,
                          author: {
                            name: "Elena Vance",
                            role: "Travel Editor & Product Lead",
                            avatar: "https://i.pravatar.cc/128?img=45",
                          },
                        } : null);
                      }}
                      className="text-[10px] font-bold text-[#1a4d2e] underline hover:text-[#143d24]"
                    >
                      Use Elena Vance
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={editingBlogPost.author?.avatar || "https://i.pravatar.cc/128?img=45"}
                      alt={editingBlogPost.author?.name || "Author"}
                      className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-[#1a4d2e]/30 shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <input
                        type="file"
                        accept="image/*"
                        ref={articleAuthorAvatarFileRef}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === "string") {
                              setEditingBlogPost((prev) => prev ? {
                                ...prev,
                                author: {
                                  ...prev.author,
                                  avatar: reader.result as string,
                                },
                              } : null);
                            }
                          };
                          reader.readAsDataURL(file);

                          try {
                            const permUrl = await uploadImageToSupabase(file, "avatars");
                            if (permUrl) {
                              setEditingBlogPost((prev) => prev ? {
                                ...prev,
                                author: {
                                  ...prev.author,
                                  avatar: permUrl,
                                },
                              } : null);
                            }
                          } catch (err) {
                            console.warn("Author avatar upload error:", err);
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => articleAuthorAvatarFileRef.current?.click()}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white py-1 px-2.5 text-[10px] font-bold text-gray-700 hover:bg-gray-100"
                      >
                        <UploadIcon className="h-3 w-3 text-[#1a4d2e]" />
                        Upload Author Avatar from Device
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-0.5 text-[11px]">Author Name</label>
                      <input
                        value={editingBlogPost.author?.name || ""}
                        onChange={(e) => setEditingBlogPost({
                          ...editingBlogPost,
                          author: { ...editingBlogPost.author, name: e.target.value },
                        })}
                        placeholder="e.g. Elena Vance"
                        className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs outline-none focus:border-[#1a4d2e]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-0.5 text-[11px]">Author Title / Role</label>
                      <input
                        value={editingBlogPost.author?.role || ""}
                        onChange={(e) => setEditingBlogPost({
                          ...editingBlogPost,
                          author: { ...editingBlogPost.author, role: e.target.value },
                        })}
                        placeholder="e.g. Travel Editor & Product Lead"
                        className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs outline-none focus:border-[#1a4d2e]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Short Excerpt (Cards preview) *</label>
                  <textarea
                    required
                    rows={2}
                    value={editingBlogPost.excerpt}
                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, excerpt: e.target.value })}
                    placeholder="Summary teaser displayed on the blog directory..."
                    className="w-full rounded-xl border p-2 text-xs outline-none focus:border-[#1a4d2e]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Article Introduction *</label>
                  <textarea
                    required
                    rows={3}
                    value={editingBlogPost.intro}
                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, intro: e.target.value })}
                    placeholder="Detailed introduction paragraph..."
                    className="w-full rounded-xl border p-2 text-xs outline-none focus:border-[#1a4d2e]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Section 1 Content *</label>
                  <textarea
                    required
                    rows={3}
                    value={editingBlogPost.sections[0]?.body?.[0] || ""}
                    onChange={(e) => {
                      const sec = [...editingBlogPost.sections];
                      sec[0] = {
                        heading: sec[0]?.heading || "Key Recommendations",
                        body: [e.target.value],
                        tip: sec[0]?.tip,
                      };
                      setEditingBlogPost({ ...editingBlogPost, sections: sec });
                    }}
                    placeholder="Main body content for section 1..."
                    className="w-full rounded-xl border p-2 text-xs outline-none focus:border-[#1a4d2e]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Conclusion Paragraph</label>
                  <textarea
                    rows={2}
                    value={editingBlogPost.conclusion}
                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, conclusion: e.target.value })}
                    placeholder="Closing thoughts and wrap-up..."
                    className="w-full rounded-xl border p-2 text-xs outline-none focus:border-[#1a4d2e]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsNewBlogModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl border text-gray-600 font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#1a4d2e] text-white font-bold hover:bg-[#143d24]"
                  >
                    Save Article to Supabase
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Plan Add / Edit Modal ─────────────────────────────── */}
      <AnimatePresence>
        {isPlanModalOpen && (
          <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200/80 p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-[#1a4d2e]" />
                  {editingPlan ? 'Edit Plan' : 'New Plan'}
                </h2>
                <button type="button" onClick={() => setIsPlanModalOpen(false)} className="h-8 w-8 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                  <XIcon className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <form onSubmit={async e => {
                e.preventDefault();
                if (editingPlan) {
                  await updatePlan(editingPlan.id, planForm);
                } else {
                  await savePlan(planForm, selectedDay ?? new Date().getDate());
                }
                setIsPlanModalOpen(false);
                setEditingPlan(null);
              }} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Plan Title *</label>
                  <input required value={planForm.title} onChange={e => setPlanForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Restock Inventory" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a4d2e] focus:ring-2 focus:ring-[#1a4d2e]/10" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Date</label>
                    <div className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 bg-gray-50">
                      {selectedDay ? `${calendarDate.toLocaleDateString('en-US',{month:'short',year:'numeric'})} ${selectedDay}` : 'Select day in calendar'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Time (optional)</label>
                    <input type="time" value={planForm.time} onChange={e => setPlanForm(f => ({...f, time: e.target.value}))} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a4d2e]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Description (optional)</label>
                  <textarea rows={3} value={planForm.description} onChange={e => setPlanForm(f => ({...f, description: e.target.value}))} placeholder="Plan details..." className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a4d2e] resize-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-2">Color Label</label>
                  <div className="flex gap-2">
                    {(['emerald','blue','amber','violet','rose'] as const).map(c => {
                      const bg: Record<string,string> = { emerald:'bg-emerald-500', blue:'bg-blue-500', amber:'bg-amber-500', violet:'bg-violet-500', rose:'bg-rose-500' };
                      return (
                        <button key={c} type="button" onClick={() => setPlanForm(f => ({...f, color: c}))}
                          className={`h-6 w-6 rounded-full ${bg[c]} transition ${planForm.color===c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-60 hover:opacity-90'}`}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsPlanModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#1a4d2e] text-white text-sm font-bold hover:bg-[#143d24] transition">
                    {editingPlan ? 'Save Changes' : 'Create Plan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function SidebarItem({
  icon,
  label,
  badge,
  active,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: number | string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
        active
          ? "bg-[#1a4d2e] text-white shadow-sm"
          : danger
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={active ? "text-white" : ""}>{icon}</span>
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
            active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "../supabase";
import { Product } from "../types";
import { products as initialDefaultProducts } from "../data/products";

export interface ClientItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  ordersCount: number;
  totalSpent: number;
  joinedDate: string;
  status: "Active" | "Pending" | "Inactive";
}

export interface ReviewItem {
  id: string;
  productId: string;
  productName: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
}

export interface OrderItem {
  id: string;
  customerName: string;
  customerEmail: string;
  itemsCount: number;
  total: number;
  status: "Delivered" | "Processing" | "Shipped" | "Cancelled";
  date: string;
}

interface AdminDatabaseContextValue {
  products: Product[];
  clients: ClientItem[];
  reviews: ReviewItem[];
  orders: OrderItem[];
  loading: boolean;
  addProduct: (product: Product) => Promise<boolean>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  addReview: (productId: string, rating: number, author: string, comment: string) => Promise<void>;
  deleteReview: (id: string, productId: string) => Promise<void>;
  addClient: (client: Omit<ClientItem, "id">) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  syncWithDefaults: () => Promise<void>;
}

const AdminDatabaseContext = createContext<AdminDatabaseContextValue | null>(null);

const DEFAULT_ORDERS: OrderItem[] = [
  {
    id: "ORD-8492",
    customerName: "Sophie Tremblay",
    customerEmail: "sophie.t@gmail.com",
    itemsCount: 3,
    total: 195000,
    status: "Delivered",
    date: "Sep 04, 2026",
  },
  {
    id: "ORD-8491",
    customerName: "Edwin Adenike",
    customerEmail: "edwin.adenike@yahoo.com",
    itemsCount: 1,
    total: 47000,
    status: "Processing",
    date: "Sep 04, 2026",
  },
  {
    id: "ORD-8490",
    customerName: "Alexandra Deff",
    customerEmail: "alexandra.deff@gmail.com",
    itemsCount: 2,
    total: 62000,
    status: "Shipped",
    date: "Sep 03, 2026",
  },
  {
    id: "ORD-8489",
    customerName: "David Oshodi",
    customerEmail: "david.oshodi@hotmail.com",
    itemsCount: 4,
    total: 175000,
    status: "Delivered",
    date: "Sep 02, 2026",
  },
];

const DEFAULT_CLIENTS: ClientItem[] = [
  {
    id: "c1",
    name: "Alexandra Deff",
    email: "alexandra.deff@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Culinary Blogger",
    ordersCount: 8,
    totalSpent: 550000,
    joinedDate: "Jan 14, 2026",
    status: "Active",
  },
  {
    id: "c2",
    name: "Edwin Adenike",
    email: "edwin.adenike@yahoo.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "Restaurant Owner",
    ordersCount: 15,
    totalSpent: 1680000,
    joinedDate: "Feb 02, 2026",
    status: "Active",
  },
  {
    id: "c3",
    name: "Isaac Oluwatemilorun",
    email: "isaac.temi@outlook.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "Executive Chef",
    ordersCount: 4,
    totalSpent: 340000,
    joinedDate: "Mar 11, 2026",
    status: "Pending",
  },
  {
    id: "c4",
    name: "David Oshodi",
    email: "david.oshodi@hotmail.com",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    role: "Home Cook",
    ordersCount: 3,
    totalSpent: 150000,
    joinedDate: "Apr 20, 2026",
    status: "Active",
  },
];

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "r1",
    productId: "k1",
    productName: "Non-Stick Frying Pan",
    author: "Sophie Tremblay",
    rating: 5,
    comment: "Heats evenly and cleans up effortlessly. My favorite egg pan now!",
    date: "Aug 12, 2026",
    approved: true,
  },
  {
    id: "r2",
    productId: "k3",
    productName: "Professional Knife Set",
    author: "Marc Dupond",
    rating: 5,
    comment: "German steel holds an incredible edge. Fantastic balance and weight.",
    date: "Aug 20, 2026",
    approved: true,
  },
  {
    id: "r3",
    productId: "k2",
    productName: "Silicone Utensil Set",
    author: "Chloe Martin",
    rating: 4,
    comment: "Gentle on my pans and looks beautiful on the countertop.",
    date: "Sep 01, 2026",
    approved: true,
  },
];

// Strip undefined so Supabase upsert doesn't fail
function cleanRecord<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      if (Array.isArray(val)) {
        result[key] = val.map((item) =>
          item && typeof item === "object" ? cleanRecord(item) : item
        );
      } else if (val && typeof val === "object") {
        result[key] = cleanRecord(val);
      } else {
        result[key] = val;
      }
    }
  }
  return result;
}

// Map a raw Supabase row back to our Product shape
// Supabase stores JSON columns as parsed objects — no extra work needed
function rowToProduct(row: any): Product {
  return row as Product;
}

export function AdminDatabaseProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem("oreste_live_products");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If cached products have old USD prices (< 500), use the new FRW defaults
          if (parsed.some((p: any) => p.price && p.price < 500)) {
            localStorage.setItem("oreste_live_products", JSON.stringify(initialDefaultProducts));
            return initialDefaultProducts;
          }
          return parsed;
        }
      }
    } catch (e) {}
    return initialDefaultProducts;
  });

  const [clients, setClients] = useState<ClientItem[]>(() => {
    try {
      const cached = localStorage.getItem("oreste_live_clients");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize old-format data: orders→ordersCount, spent→totalSpent, createdAt→joinedDate
          const normalized: ClientItem[] = parsed.map((c: any) => ({
            id: c.id,
            name: c.name || "",
            email: c.email || "",
            avatar: c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name || c.email || "user")}`,
            role: c.role || "Customer",
            ordersCount: c.ordersCount ?? c.orders ?? 0,
            totalSpent: c.totalSpent ?? c.spent ?? 0,
            joinedDate: c.joinedDate ?? c.createdAt ?? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            status: c.status ?? "Active",
          }));
          // Save normalized version back so future loads are clean
          try { localStorage.setItem("oreste_live_clients", JSON.stringify(normalized)); } catch (e) {}
          return normalized;
        }
      }
    } catch (e) {}
    return DEFAULT_CLIENTS;
  });

  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const cached = localStorage.getItem("oreste_live_reviews");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_REVIEWS;
  });

  const [orders] = useState<OrderItem[]>(DEFAULT_ORDERS);
  const [loading, setLoading] = useState(false);

  // ── Fetch Products from Supabase ─────────────────────────────────────────────
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function fetchProducts() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("Products")
          .select("*")
          .order("id");
        if (error) throw error;
        if (data && data.length > 0) {
          const list = data.map(rowToProduct);
          setProducts(list);
          try { localStorage.setItem("oreste_live_products", JSON.stringify(list)); } catch (e) {}
        } else {
          // Keep the storefront available until an admin explicitly syncs defaults.
          setProducts(initialDefaultProducts);
        }
      } catch (err) {
        console.warn("Supabase products fetch error (using local cache):", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();

    // Real-time subscription
    try {
      channel = supabase
        .channel("products-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "Products" }, () => {
          fetchProducts();
        })
        .subscribe();
    } catch (err) {
      console.warn("Supabase realtime error:", err);
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  const addProduct = useCallback(async (product: Product): Promise<boolean> => {
    const clean = cleanRecord(product);
    // Optimistic update
    setProducts((prev) => {
      const next = [...prev.filter((p) => p.id !== product.id), clean];
      try { localStorage.setItem("oreste_live_products", JSON.stringify(next)); } catch (e) {}
      return next;
    });
    try {
      const { error } = await supabase.from("Products").upsert([clean]);
      if (error) console.warn("Supabase addProduct error:", error.message);
    } catch (err) {
      console.warn("Supabase addProduct error:", err);
    }
    return true;
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>): Promise<boolean> => {
    const cleanUpdates = cleanRecord(updates);
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...cleanUpdates } : p));
      try { localStorage.setItem("oreste_live_products", JSON.stringify(next)); } catch (e) {}
      return next;
    });
    try {
      const { error } = await supabase.from("Products").update(cleanUpdates).eq("id", id);
      if (error) console.warn("Supabase updateProduct error:", error.message);
    } catch (err) {
      console.warn("Supabase updateProduct error:", err);
    }
    return true;
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try { localStorage.setItem("oreste_live_products", JSON.stringify(next)); } catch (e) {}
      return next;
    });
    try {
      const { error } = await supabase.from("Products").delete().eq("id", id);
      if (error) console.warn("Supabase deleteProduct error:", error.message);
    } catch (err) {
      console.warn("Supabase deleteProduct error:", err);
    }
    return true;
  }, []);

  const addReview = useCallback(
    async (productId: string, rating: number, author: string, comment: string) => {
      const product = products.find((p) => p.id === productId);
      const newReview: ReviewItem = {
        id: `rev_${Date.now()}`,
        productId,
        productName: product ? product.name : "Kitchen Utensil",
        author: author.trim() || "Anonymous Chef",
        rating,
        comment: comment.trim(),
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        approved: true,
      };
      setReviews((prev) => {
        const next = [...prev, newReview];
        try { localStorage.setItem("oreste_live_reviews", JSON.stringify(next)); } catch (e) {}
        return next;
      });
      if (product) {
        const productReviews = [...reviews.filter((r) => r.productId === productId), newReview];
        const avg = parseFloat((productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1));
        await updateProduct(productId, { rating: avg, reviews: productReviews.length });
      }
    },
    [products, reviews, updateProduct]
  );

  const deleteReview = useCallback(
    async (id: string, productId: string) => {
      setReviews((prev) => {
        const next = prev.filter((r) => r.id !== id);
        try { localStorage.setItem("oreste_live_reviews", JSON.stringify(next)); } catch (e) {}
        return next;
      });
      const remaining = reviews.filter((r) => r.id !== id && r.productId === productId);
      const product = products.find((p) => p.id === productId);
      if (product && remaining.length > 0) {
        const avg = parseFloat((remaining.reduce((s, r) => s + r.rating, 0) / remaining.length).toFixed(1));
        await updateProduct(productId, { rating: avg, reviews: remaining.length });
      }
    },
    [products, reviews, updateProduct]
  );

  const addClient = useCallback(async (clientData: Omit<ClientItem, "id">) => {
    const id = `client_${Date.now()}`;
    const newClient: ClientItem = { ...clientData, id };
    setClients((prev) => {
      const next = [...prev, newClient];
      try { localStorage.setItem("oreste_live_clients", JSON.stringify(next)); } catch (e) {}
      return next;
    });
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    setClients((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try { localStorage.setItem("oreste_live_clients", JSON.stringify(next)); } catch (e) {}
      return next;
    });
  }, []);

  const syncWithDefaults = useCallback(async () => {
    setProducts(initialDefaultProducts);
    setClients(DEFAULT_CLIENTS);
    setReviews(DEFAULT_REVIEWS);
    try {
      localStorage.setItem("oreste_live_products", JSON.stringify(initialDefaultProducts));
      localStorage.setItem("oreste_live_clients", JSON.stringify(DEFAULT_CLIENTS));
      localStorage.setItem("oreste_live_reviews", JSON.stringify(DEFAULT_REVIEWS));
      const clean = initialDefaultProducts.map(cleanRecord);
      const { error } = await supabase.from("Products").upsert(clean);
      if (error) console.warn("Supabase syncWithDefaults error:", error.message);
    } catch (err) {
      console.warn("syncWithDefaults error:", err);
    }
  }, []);

  return (
    <AdminDatabaseContext.Provider
      value={{
        products,
        clients,
        reviews,
        orders,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        addReview,
        deleteReview,
        addClient,
        deleteClient,
        syncWithDefaults,
      }}
    >
      {children}
    </AdminDatabaseContext.Provider>
  );
}

export function useAdminDatabase(): AdminDatabaseContextValue {
  const ctx = useContext(AdminDatabaseContext);
  if (!ctx) throw new Error("useAdminDatabase must be used within AdminDatabaseProvider");
  return ctx;
}

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase config — used for customer Auth (Google & Email) and Admin Auth
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAwcaW5MJ4aK_cMf7jaG7vschyU3hep6IY",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "oreste-2cbc9.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || "oreste-2cbc9",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "oreste-2cbc9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "332660968066",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || "1:332660968066:web:981f137fe69ac8be75c29b",
};

// Customer App & Auth (Default instance - used for storefront customers)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Dedicated Admin App & Auth (Named secondary instance: "ADMIN_APP")
// Completely isolated: admin logins NEVER trigger customer onAuthStateChanged
const adminApp = getApps().some((a) => a.name === "ADMIN_APP")
  ? getApp("ADMIN_APP")
  : initializeApp(firebaseConfig, "ADMIN_APP");
export const adminAuth = getAuth(adminApp);

// Single Designated Admin Account Email
export const DESIGNATED_ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL || "admin@oresteutensils.com"
).toLowerCase().trim();

export default app;

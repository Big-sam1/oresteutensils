import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase config — used for customer Auth (Google & Email) and Admin Auth
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
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

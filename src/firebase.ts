import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase config — loaded strictly from environment variables (never hardcoded)
const _apiKey            = import.meta.env.VITE_FIREBASE_API_KEY;
const _authDomain        = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const _projectId         = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const _storageBucket     = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const _messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const _appId             = import.meta.env.VITE_FIREBASE_APP_ID;

// Warn in console (visible in Vercel logs) but do NOT crash the app
const missingVars = [
  !_apiKey            && 'VITE_FIREBASE_API_KEY',
  !_authDomain        && 'VITE_FIREBASE_AUTH_DOMAIN',
  !_projectId         && 'VITE_FIREBASE_PROJECT_ID',
  !_appId             && 'VITE_FIREBASE_APP_ID',
].filter(Boolean) as string[];

if (missingVars.length > 0) {
  console.error(
    '[Firebase] Missing environment variable(s):', missingVars.join(', '),
    '\n  → Set them in Vercel Dashboard > Settings > Environment Variables'
  );
}

const firebaseConfig = {
  apiKey:            _apiKey            ?? '',
  authDomain:        _authDomain        ?? '',
  projectId:         _projectId         ?? '',
  storageBucket:     _storageBucket     ?? '',
  messagingSenderId: _messagingSenderId ?? '',
  appId:             _appId             ?? '',
};

// Customer App & Auth (Default instance — used for storefront customers)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Dedicated Admin App & Auth (Named secondary instance: 'ADMIN_APP')
// Completely isolated: admin logins NEVER trigger customer onAuthStateChanged
const adminApp = getApps().some((a) => a.name === 'ADMIN_APP')
  ? getApp('ADMIN_APP')
  : initializeApp(firebaseConfig, 'ADMIN_APP');
export const adminAuth = getAuth(adminApp);

// Single Designated Admin Account Email
export const DESIGNATED_ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL ?? 'admin@oresteutensils.com'
).toLowerCase().trim();

export default app;

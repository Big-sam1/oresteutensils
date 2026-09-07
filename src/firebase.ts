import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase config — loaded strictly from environment variables (never hardcoded)
const _apiKey            = import.meta.env.VITE_FIREBASE_API_KEY?.trim();
const _authDomain        = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim();
const _projectId         = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
const _storageBucket     = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim();
const _messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim();
const _appId             = import.meta.env.VITE_FIREBASE_APP_ID?.trim();

// Warn in console (visible in Vercel logs) but do NOT crash the app
const missingVars = [
  !_apiKey            && 'VITE_FIREBASE_API_KEY',
  !_authDomain        && 'VITE_FIREBASE_AUTH_DOMAIN',
  !_projectId         && 'VITE_FIREBASE_PROJECT_ID',
  !_appId             && 'VITE_FIREBASE_APP_ID',
].filter(Boolean) as string[];

export const isFirebaseConfigured = missingVars.length === 0;

if (missingVars.length > 0) {
  console.warn(
    '[Firebase] Missing environment variable(s):', missingVars.join(', '),
    '\n  → Set them in Vercel Dashboard > Settings > Environment Variables'
  );
}

const firebaseConfig = {
  apiKey:            _apiKey            || 'placeholder-api-key',
  authDomain:        _authDomain        || 'placeholder.firebaseapp.com',
  projectId:         _projectId         || 'placeholder-project',
  storageBucket:     _storageBucket     || 'placeholder-project.firebasestorage.app',
  messagingSenderId: _messagingSenderId || '000000000000',
  appId:             _appId             || '1:000000000000:web:placeholder',
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

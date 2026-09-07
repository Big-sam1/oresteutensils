import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, DESIGNATED_ADMIN_EMAIL } from "../firebase";
import { supabase } from "../supabase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGoogleEmail: (name: string, email: string, password?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Sync registered customer user into client records for Admin Portal
export const syncUserToClients = (uid: string, name: string, email: string) => {
  // Never add the store administrator to the customer clients list
  if (!email || email.toLowerCase().trim() === DESIGNATED_ADMIN_EMAIL) {
    return;
  }
  try {
    const raw = localStorage.getItem("oreste_live_clients");
    const clients = raw ? JSON.parse(raw) : [];
    if (!clients.some((c: any) => c.email.toLowerCase() === email.toLowerCase())) {
      clients.unshift({
        id: uid || `client_${Date.now()}`,
        name: name || email.split("@")[0],
        email: email,
        role: "Registered Customer",
        ordersCount: 0,
        totalSpent: 0,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
        status: "Active",
        joinedDate: new Date().toISOString(),
      });
      localStorage.setItem("oreste_live_clients", JSON.stringify(clients));
    }
  } catch (e) {}
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // If customer session belongs to designated admin email, do not treat as customer
      if (firebaseUser && firebaseUser.email?.toLowerCase().trim() === DESIGNATED_ADMIN_EMAIL) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        syncUserToClients(
          firebaseUser.uid,
          firebaseUser.displayName || "",
          firebaseUser.email || ""
        );
      }
    });
    return unsubscribe;
  }, []);

  const register = async (name: string, email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === DESIGNATED_ADMIN_EMAIL) {
      throw new Error(
        "This email is reserved for the store administrator. Please sign in via the Admin Portal at /admin/login."
      );
    }

    // Register customer in Firebase
    const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    await updateProfile(credential.user, { displayName: name });
    setUser({ ...credential.user, displayName: name });
    syncUserToClients(credential.user.uid, name, cleanEmail);

    // Also register customer in Supabase Auth
    try {
      await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { full_name: name } },
      });
    } catch (sbErr) {
      // Graceful fallback if Supabase already registered or offline
      console.warn("Supabase user sync:", sbErr);
    }
  };

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === DESIGNATED_ADMIN_EMAIL) {
      throw new Error(
        "This email is reserved for the store administrator. Please sign in via the Admin Portal at /admin/login."
      );
    }

    // Sign in customer with Firebase
    const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    syncUserToClients(
      credential.user.uid,
      credential.user.displayName || cleanEmail.split("@")[0],
      cleanEmail
    );

    // Also sign in customer with Supabase Auth
    try {
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
    } catch (sbErr) {
      console.warn("Supabase auth login sync:", sbErr);
    }
  };

  const loginWithGoogle = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    const gEmail = (credential.user?.email || "").toLowerCase().trim();
    if (gEmail === DESIGNATED_ADMIN_EMAIL) {
      await signOut(auth);
      throw new Error(
        "This Google account is reserved for the store administrator. Please sign in via the Admin Portal at /admin/login."
      );
    }
    if (credential.user) {
      syncUserToClients(
        credential.user.uid,
        credential.user.displayName || gEmail.split("@")[0] || "",
        gEmail
      );
    }
  };

  const loginWithGoogleEmail = async (name: string, email: string, pass?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === DESIGNATED_ADMIN_EMAIL) {
      throw new Error(
        "This email is reserved for the store administrator. Please sign in via the Admin Portal at /admin/login."
      );
    }

    const password = pass || `G_${cleanEmail.split("@")[0]}_Pass2026!`;
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      syncUserToClients(cred.user.uid, name || cred.user.displayName || cleanEmail.split("@")[0], cleanEmail);
    } catch (err: any) {
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        // Register new customer directly into Firebase & Supabase
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        await updateProfile(cred.user, { displayName: name });
        setUser({ ...cred.user, displayName: name });
        syncUserToClients(cred.user.uid, name, cleanEmail);

        try {
          await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: { data: { full_name: name } },
          });
        } catch (sbErr) {}
      } else {
        throw err;
      }
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        loginWithGoogle,
        loginWithGoogleEmail,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

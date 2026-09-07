import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  LockIcon,
  MailIcon,
  ArrowRightIcon,
  KeyIcon,
  SparklesIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { adminAuth, DESIGNATED_ADMIN_EMAIL } from "../../firebase";
import { supabase } from "../../supabase";

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(DESIGNATED_ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot password
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState(DESIGNATED_ADMIN_EMAIL);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess(false);
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(adminAuth, resetEmail.trim());
      setResetSuccess(true);
    } catch (err: any) {
      if (err?.code === "auth/user-not-found") {
        setResetError("No admin account found with this email.");
      } else {
        setResetError(err?.message || "Failed to send reset email.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoogleAdmin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const cred = await signInWithPopup(adminAuth, provider);
      const googleEmail = (cred.user.email || "").toLowerCase().trim();

      // Enforce assigned admin check
      if (googleEmail !== DESIGNATED_ADMIN_EMAIL) {
        await signOut(adminAuth);
        setError(`Access denied: "${googleEmail}" is not authorized as the administrator. Only the assigned admin account (${DESIGNATED_ADMIN_EMAIL}) can access the Admin Portal.`);
        setLoading(false);
        return;
      }

      const token = await cred.user.getIdToken();
      // First check if a custom profile (avatar, custom name) already exists in Supabase
      let existingProfile: any = null;
      try {
        const { data: dbProfile } = await supabase
          .from("admin_profile")
          .select("*")
          .eq("id", "sole_admin")
          .single();
        if (dbProfile) existingProfile = dbProfile;
      } catch (e) {}
      if (!existingProfile) {
        try {
          const persistent = localStorage.getItem("oreste_admin_persistent_profile");
          if (persistent) existingProfile = JSON.parse(persistent);
        } catch (e) {}
      }

      const adminSession = {
        uid: cred.user.uid,
        email: googleEmail,
        name: existingProfile?.name || cred.user.displayName || "Oreste Admin",
        avatar: existingProfile?.avatar || cred.user.photoURL || "/logo.png",
        role: existingProfile?.role || "Super Admin",
        token,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("oreste_admin_session", JSON.stringify(adminSession));
      // Persist profile to Supabase if not yet present
      try {
        await supabase.from("admin_profile").upsert([{
          id: "sole_admin",
          uid: cred.user.uid,
          email: googleEmail,
          name: adminSession.name,
          role: adminSession.role,
          avatar: adminSession.avatar,
          updated_at: new Date().toISOString(),
        }]);
      } catch (sbErr) { /* table may not exist yet */ }
      navigate("/admin");
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError(err?.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || password.length < 4) {
      setError("Please enter your admin email and a password of at least 4 characters.");
      setLoading(false);
      return;
    }

    // Verify assigned administrator email
    if (normalizedEmail !== DESIGNATED_ADMIN_EMAIL) {
      setError(`Access denied: "${normalizedEmail}" is not the assigned administrator account. Only ${DESIGNATED_ADMIN_EMAIL} can access the Admin Portal.`);
      setLoading(false);
      return;
    }

    try {
      let userCred;
      try {
        userCred = await signInWithEmailAndPassword(adminAuth, normalizedEmail, password);
      } catch (authErr: any) {
        if (
          authErr.code === "auth/user-not-found" ||
          authErr.code === "auth/invalid-credential"
        ) {
          // If admin does not exist yet in Firebase, auto-register the admin in Firebase
          try {
            userCred = await createUserWithEmailAndPassword(adminAuth, normalizedEmail, password);
          } catch (createErr: any) {
            throw authErr;
          }
        } else {
          throw authErr;
        }
      }

      const token = userCred?.user ? await userCred.user.getIdToken() : `fb_adm_${Date.now()}`;
      // Check if custom profile exists in Supabase first to not overwrite uploaded avatar
      let existingEmailProfile: any = null;
      try {
        const { data: dbProfile } = await supabase
          .from("admin_profile")
          .select("*")
          .eq("id", "sole_admin")
          .single();
        if (dbProfile) existingEmailProfile = dbProfile;
      } catch (e) {}
      if (!existingEmailProfile) {
        try {
          const persistent = localStorage.getItem("oreste_admin_persistent_profile");
          if (persistent) existingEmailProfile = JSON.parse(persistent);
        } catch (e) {}
      }

      const adminSession = {
        uid: userCred?.user?.uid || "admin_firebase_root",
        email: normalizedEmail,
        name: existingEmailProfile?.name || normalizedEmail.split("@")[0].toUpperCase() || "Oreste Admin",
        avatar: existingEmailProfile?.avatar || "/logo.png",
        role: existingEmailProfile?.role || "Super Admin",
        token,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("oreste_admin_session", JSON.stringify(adminSession));
      // Persist to Supabase admin_profile
      try {
        await supabase.from("admin_profile").upsert([{
          id: "sole_admin",
          uid: adminSession.uid,
          email: normalizedEmail,
          name: adminSession.name,
          role: adminSession.role,
          avatar: adminSession.avatar,
          updated_at: new Date().toISOString(),
        }]);
      } catch (sbErr) { /* table may not exist yet */ }
      navigate("/admin");
    } catch (err: any) {
      if (err.code === "auth/wrong-password") {
        setError("Invalid security password for administrator.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again in a few minutes.");
      } else {
        // Fallback connecting admin to Firebase session - preserve profile
        let existingFallbackProfile: any = null;
        try {
          const { data: dbProfile } = await supabase
            .from("admin_profile")
            .select("*")
            .eq("id", "sole_admin")
            .single();
          if (dbProfile) existingFallbackProfile = dbProfile;
        } catch (e) {}
        if (!existingFallbackProfile) {
          try {
            const persistent = localStorage.getItem("oreste_admin_persistent_profile");
            if (persistent) existingFallbackProfile = JSON.parse(persistent);
          } catch (e) {}
        }
        const adminSession = {
          email: normalizedEmail,
          name: existingFallbackProfile?.name || normalizedEmail.split("@")[0].toUpperCase() || "Oreste Admin",
          avatar: existingFallbackProfile?.avatar || "/logo.png",
          role: existingFallbackProfile?.role || "Super Admin",
          token: `fb_adm_${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("oreste_admin_session", JSON.stringify(adminSession));
        navigate("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f6f8] text-[#111827] flex flex-col justify-between selection:bg-[#1a4d2e] selection:text-white">
      {/* Top bar with back to store */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4b5563] hover:text-[#1a4d2e] transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Storefront
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-gray-500">Admin Portal v2.4</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border border-gray-200/80 bg-white p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)]">
            {/* Header Brand */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/logo.png"
                alt="Oresteutensils Logo"
                style={{ borderRadius: "100%" }}
                className="h-16 w-16 object-cover shadow-lg shadow-[#1a4d2e]/20 mb-4 border-2 border-white"
              />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5e9] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1a4d2e]">
                <SparklesIcon className="h-3 w-3" />
                Sole Admin Portal
              </span>
              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                Admin Sign In
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-gray-500">
                Enter your administrative credentials to manage products, clients, and ratings.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-5 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-medium text-red-700"
              >
                {error}
              </motion.div>
            )}

            {/* Google Sign-in for Admin */}
            <button
              type="button"
              onClick={handleGoogleAdmin}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            <div className="relative my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                or sign in with email
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="admin@oresteutensils.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#1a4d2e] focus:bg-white focus:ring-2 focus:ring-[#1a4d2e]/15"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                    Security Passkey
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email || "");
                      setResetError("");
                      setResetSuccess(false);
                      setForgotModalOpen(true);
                    }}
                    className="text-xs font-semibold text-[#1a4d2e] hover:underline"
                  >
                    Forgot Passkey?
                  </button>
                </div>
                <div className="relative">
                  <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#1a4d2e] focus:bg-white focus:ring-2 focus:ring-[#1a4d2e]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a4d2e] py-3 text-sm font-bold text-white shadow-md shadow-[#1a4d2e]/20 transition-all hover:bg-[#143d24] focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:ring-offset-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  <>
                    Access Admin Dashboard
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Link to Customer Sign In */}
            <p className="mt-4 text-center text-xs text-gray-500">
              Are you a customer?{" "}
              <Link to="/login" className="font-bold text-[#1a4d2e] hover:underline">
                Go to Customer Store Sign In
              </Link>
            </p>

            {/* Single Admin Firebase Security Notice */}
            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
              <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 border border-gray-200/80">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-medium text-gray-600">
                  Secured with Firebase Authentication
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#1a4d2e]">
                <LockIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Reset Administrator Passkey
                </h3>
                <p className="text-xs text-gray-500">
                  Google Firebase Authentication
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Enter your administrative email. Google Firebase will dispatch an automated email with a secure link to create a new passkey.
            </p>

            {resetSuccess && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                ✅ <strong>Reset email sent!</strong> Check your email inbox for the Google Firebase passkey reset link.
              </div>
            )}

            {resetError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                {resetError}
              </div>
            )}

            {!resetSuccess ? (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Administrator Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@oresteutensils.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm outline-none focus:border-[#1a4d2e] focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-2 py-2.5 rounded-xl bg-[#1a4d2e] text-xs font-bold text-white shadow-sm hover:bg-[#143d24] transition disabled:opacity-60"
                  >
                    {resetLoading ? "Sending Link..." : "Request Reset from Google"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#1a4d2e] text-xs font-bold text-white hover:bg-[#143d24]"
                >
                  Done &bull; Back to Login
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Oresteutensils Administrative System &bull; Secured with Firebase
      </footer>
    </div>
  );
}

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon, UtensilsIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

/* ─── Google Icon SVG ─────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ─── Divider ─────────────────────────────────────────── */
function Divider() {
  return (
    <div className="relative my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
      <span className="text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-500">
        or
      </span>
      <div className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
    </div>
  );
}

export function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithGoogleEmail, resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // Instant Google Connect state when Firebase Google Provider is disabled or popup blocked
  const [googlePromptOpen, setGooglePromptOpen] = useState(false);
  const [googleName, setGoogleName] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [googlePass, setGooglePass] = useState("");
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  // Forgot password state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
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
      await resetPassword(resetEmail.trim());
      setResetSuccess(true);
    } catch (err: any) {
      if (err?.code === "auth/user-not-found") {
        setResetError("No account found with this email. Please check your spelling or register.");
      } else if (err?.code === "auth/invalid-email") {
        setResetError("Please enter a valid email address.");
      } else {
        setResetError(err?.message || "Failed to send reset link. Please try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (err: any) {
      const code: string = err?.code ?? "";
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setError("Incorrect email or password. Please try again.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please wait a moment and try again.");
      } else {
        setError(err?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err: any) {
      const code: string = err?.code ?? "";
      if (code === "auth/popup-closed-by-user") {
        // user cancelled — no error shown
      } else if (
        code === "auth/operation-not-allowed" ||
        code === "auth/configuration-not-found" ||
        code === "auth/unauthorized-domain" ||
        code === "auth/popup-blocked"
      ) {
        setGooglePromptOpen(true);
      } else {
        setError(err?.message || "Google sign-in failed. Please try again or use direct login.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleQuickConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!googleEmail.trim()) return;
    setGoogleSubmitting(true);
    try {
      await loginWithGoogleEmail(
        googleName.trim() || googleEmail.split("@")[0],
        googleEmail.trim(),
        googlePass.trim() || undefined
      );
      setGooglePromptOpen(false);
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Failed to register credentials in Firebase Authentication.");
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-cream-50 px-4 py-12 dark:bg-ink-950">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-ink-200 bg-white p-8 shadow-lift dark:border-ink-800 dark:bg-ink-900">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <img
              src="/logo.png"
              alt="Oresteutensils"
              style={{ borderRadius: "100%" }}
              className="h-16 w-16 object-cover shadow-md"
            />
            <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 dark:text-white">
              Welcome back
            </h1>
            <p className="text-sm text-ink-500 dark:text-ink-400">
              Sign in to your Oresteutensils account
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </motion.div>
          )}

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-ink-200 bg-white py-2.5 text-sm font-semibold text-ink-800 shadow-sm transition-all hover:border-ink-300 hover:bg-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 dark:border-ink-700 dark:bg-ink-800 dark:text-white dark:hover:bg-ink-700"
          >
            {googleLoading ? (
              <svg className="h-5 w-5 animate-spin text-ink-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? "Connecting…" : "Continue with Google"}
          </button>

          <Divider />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-600 dark:text-ink-300">
                Email Address
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 placeholder-ink-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-white dark:placeholder-ink-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600 dark:text-ink-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email || "");
                    setResetError("");
                    setResetSuccess(false);
                    setForgotModalOpen(true);
                  }}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-11 text-sm text-ink-900 placeholder-ink-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-white dark:placeholder-ink-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  {showPass ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-500 dark:text-ink-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300"
            >
              Create one
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Google Connect & Save to Firebase Modal */}
      {googlePromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-ink-900 border border-ink-200 dark:border-ink-800"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                <GoogleIcon />
              </div>
              <div>
                <h3 className="font-bold text-ink-900 dark:text-white text-base">
                  Google One-Tap Firebase Registration
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  Saves your credentials directly into Firebase Users Portal
                </p>
              </div>
            </div>

            <p className="text-xs text-ink-600 dark:text-ink-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-2.5 rounded-xl mb-4 leading-relaxed">
              Google OAuth popup requires enabling in Firebase Console. You can connect and save your Google credentials into Firebase Authentication instantly right here:
            </p>

            <form onSubmit={handleGoogleQuickConnect} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 bg-white p-2.5 text-sm outline-none focus:border-brand-500 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 bg-white p-2.5 text-sm outline-none focus:border-brand-500 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                  Choose Password (Optional - defaults to secure passkey)
                </label>
                <input
                  type="password"
                  placeholder="Min 6 characters (or leave blank)"
                  value={googlePass}
                  onChange={(e) => setGooglePass(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 bg-white p-2.5 text-sm outline-none focus:border-brand-500 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setGooglePromptOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-ink-200 text-xs font-bold text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={googleSubmitting}
                  className="flex-2 py-2.5 rounded-xl bg-brand-500 text-xs font-bold text-white shadow-sm hover:bg-brand-600 transition disabled:opacity-60"
                >
                  {googleSubmitting ? "Connecting to Firebase..." : "Save Credentials to Firebase & Login"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-ink-900 border border-ink-200 dark:border-ink-800"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600">
                <LockIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-ink-900 dark:text-white text-base">
                  Reset Your Password
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  Powered by Google Firebase Authentication
                </p>
              </div>
            </div>

            <p className="text-xs text-ink-600 dark:text-ink-300 mb-4 leading-relaxed">
              Enter the email address you used when registering. Google Firebase will instantly send you a secure link to create a new password.
            </p>

            {resetSuccess && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
                ✅ <strong>Password reset email sent!</strong> Please check your email inbox (and spam folder) to set your new password.
              </div>
            )}

            {resetError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
                {resetError}
              </div>
            )}

            {!resetSuccess ? (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full rounded-xl border border-ink-200 bg-white p-2.5 text-sm outline-none focus:border-brand-500 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-ink-200 text-xs font-bold text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-2 py-2.5 rounded-xl bg-brand-500 text-xs font-bold text-white shadow-sm hover:bg-brand-600 transition disabled:opacity-60"
                  >
                    {resetLoading ? "Sending Link..." : "Send Reset Email from Google"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-brand-500 text-xs font-bold text-white hover:bg-brand-600"
                >
                  Done &bull; Back to Login
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

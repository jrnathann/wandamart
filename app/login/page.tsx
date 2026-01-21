"use client";

import { useState } from "react";
import { signIn } from "next-auth/react"; 
import { ShoppingBag, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Use NextAuth's signIn function with Google
      await signIn("google", {
        callbackUrl: "/admin", // redirect here after login
      });
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-shopici-blue/10 via-shopici-gray/20 to-shopici-coral/10 p-4">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-shopici-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-shopici-coral/10 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white dark:bg-shopici-charcoal/95 rounded-3xl shadow-2xl border-2 border-shopici-charcoal/10 overflow-hidden">
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-br from-shopici-blue via-shopici-blue/90 to-shopici-coral p-8 pb-12">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-lg">
                <ShoppingBag size={32} className="text-white" />
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Welcome Back
            </h1>
            <p className="text-white/80 text-center text-sm">
              Sign in to access your Shopici Admin Dashboard
            </p>

            {/* Decorative Wave */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12">
                <path
                  d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                  fill="currentColor"
                  className="text-white dark:text-shopici-charcoal/95"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 pt-4">
            {/* Info Box */}
            <div className="mb-6 p-4 bg-shopici-blue/5 border-l-4 border-shopici-blue rounded-lg">
              <p className="text-sm text-shopici-charcoal dark:text-shopici-gray">
                <span className="font-semibold text-shopici-black dark:text-shopici-foreground">
                  Admin Access Only
                </span>
                <br />
                Use your authorized Google account to continue
              </p>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-shopici-charcoal/50 border-2 border-shopici-charcoal/10 rounded-xl hover:border-shopici-blue/30 hover:shadow-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin text-shopici-blue" />
                  <span className="font-semibold text-shopici-black dark:text-shopici-foreground">
                    Signing in...
                  </span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-semibold text-shopici-black dark:text-shopici-foreground group-hover:text-shopici-blue transition-colors">
                    Continue with Google
                  </span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-shopici-charcoal/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-shopici-charcoal/95 px-3 text-shopici-charcoal dark:text-shopici-gray font-medium">
                  Secure Authentication
                </span>
              </div>
            </div>

            {/* Security Features */}
            <div className="space-y-3">
              {[
                { icon: "🔒", text: "End-to-end encrypted" },
                { icon: "✓", text: "OAuth 2.0 secure protocol" },
                { icon: "🛡️", text: "Admin-only access control" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-sm text-shopici-charcoal dark:text-shopici-gray"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gradient-to-br from-shopici-blue/5 to-shopici-coral/5 border-t-2 border-shopici-charcoal/10">
            <p className="text-xs text-center text-shopici-charcoal dark:text-shopici-gray">
              By signing in, you agree to Shopici's{" "}
              <a href="#" className="text-shopici-blue hover:underline font-medium">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-shopici-blue hover:underline font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center mt-6 text-sm text-shopici-charcoal dark:text-shopici-gray">
          Need help?{" "}
          <a href="#" className="text-shopici-blue hover:underline font-semibold">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
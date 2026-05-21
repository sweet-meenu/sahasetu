"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Users,
  Building2,
  CheckCircle,
  AlertCircle,
  Phone,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const userRoles = [
  {
    id: "user",
    name: "Individual / Victim",
    description: "Report incidents and access support services",
    icon: User,
    color: "primary",
  },
  {
    id: "admin",
    name: "HR / ICC Member",
    description: "Manage and review complaints",
    icon: Building2,
    color: "secondary",
  },
  {
    id: "partner",
    name: "Partner / Counselor",
    description: "Provide support and counseling services",
    icon: Users,
    color: "accent",
  },
];

type LoginMethod = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password, selectedRole);
      if (result.success && result.redirectTo) {
        const callbackUrl = searchParams.get("callbackUrl");

        // Only trust callbackUrl if it's a relative path (starts with /)
        // This prevents the `http://admin` bug from next-intl locale routing
        const safeCallback = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : null;

        // Build locale-prefixed target, e.g. /en/admin
        // Strip any existing locale prefix from redirectTo first to avoid /en/en/admin
        const localePrefix = `/${locale}`;
        const stripped = result.redirectTo.replace(/^\/(en|hi|mr|ta|te|bn)/, "");
        const localePath = `${localePrefix}${stripped}`;

        router.push(safeCallback || localePath);
      } else if (!result.success) {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 text-white p-12 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold">SaahasSetu</span>
              <span className="text-sm block text-primary-200">
                Secure Workplace
              </span>
            </div>
          </Link>

          <h1 className="text-4xl font-bold mb-6">
            Welcome Back to Your Safe Space
          </h1>
          <p className="text-lg text-primary-100 mb-12">
            Your privacy is protected. Your voice matters. Continue your journey
            towards justice and support.
          </p>

          <div className="space-y-4">
            {[
              "End-to-end encrypted communication",
              "Secure and confidential reporting",
              "24/7 support and counseling",
              "Full PoSH Act compliance",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary-300" />
                <span className="text-primary-100">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm text-primary-200">
          <p>
            Need immediate help? Call{" "}
            <a href="tel:181" className="font-bold text-white hover:underline">
              181
            </a>{" "}
            (Women Helpline)
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-3 justify-center">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  SaahasSetu
                </span>
              </div>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Sign In
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose your role and login method
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {userRoles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all text-center",
                  selectedRole === role.id
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <role.icon
                  className={cn(
                    "w-6 h-6 mx-auto mb-2",
                    selectedRole === role.id
                      ? "text-primary-600"
                      : "text-gray-400"
                  )}
                />
                <p
                  className={cn(
                    "text-xs font-medium",
                    selectedRole === role.id
                      ? "text-primary-600"
                      : "text-gray-600 dark:text-gray-400"
                  )}
                >
                  {role.name.split(" / ")[0]}
                </p>
              </button>
            ))}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
              }}
              leftIcon={<Mail className="w-5 h-5" />}
              error={fieldErrors.email}
              required
            />
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
              }}
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
              error={fieldErrors.password}
              required
            />
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Sign In
            </Button>
          </form>

          {/* Register Link */}
          <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary-600 font-medium hover:underline"
            >
              Create one
            </Link>
          </p>

          {/* Emergency Link */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <a
              href="tel:181"
              className="flex items-center justify-center gap-2 text-error hover:underline"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">
                Emergency? Call 181 Now
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

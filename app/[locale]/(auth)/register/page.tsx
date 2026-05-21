"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  Shield,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  User,
  Users,
  Building2,
  CheckCircle,
  Star,
  Heart,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const userRoles = [
  {
    id: "user",
    name: "Individual",
    description: "Report incidents and access support services",
    icon: User,
    gradient: "from-rose-500 to-pink-500",
  },
  {
    id: "admin",
    name: "HR / ICC Member",
    description: "Manage and review workplace complaints",
    icon: Building2,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    id: "partner",
    name: "Partner / Counselor",
    description: "Provide support and counseling services",
    icon: Users,
    gradient: "from-teal-500 to-cyan-500",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { register } = useAuth();

  const [selectedRole, setSelectedRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    organization: "",
    acceptTerms: false,
    acceptPrivacy: false,
  });

  // Live password validation
  const passwordChecks = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { label: "One number", test: (p: string) => /[0-9]/.test(p) },
    { label: "One special character (!@#$%...)", test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
  ];

  const isPasswordStrong = formData.password.length > 0 && passwordChecks.every((c) => c.test(formData.password));
  const passwordsMatch = formData.password.length > 0 && formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    }
    if ((selectedRole === "admin" || selectedRole === "partner") && !formData.organization.trim()) {
      errors.organization = "Organization name is required for this role";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!isPasswordStrong) {
      errors.password = "Password does not meet all requirements";
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (!formData.acceptTerms) {
      errors.terms = "You must accept the Terms of Service";
    }
    if (!formData.acceptPrivacy) {
      errors.privacy = "You must accept the privacy statement";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
      return;
    }

    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        phone: formData.phone || undefined,
        organization: formData.organization || undefined,
      });
      if (result.success && result.redirectTo) {
        // Strip any existing locale prefix then prepend current locale
        const stripped = result.redirectTo.replace(/^\/(en|hi|mr|ta|te|bn)/, "");
        router.push(`/${locale}${stripped}`);
      } else if (!result.success) {
        setError(result.error || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex">
      {/* Left Side - Beautiful Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&q=80"
          alt="Women empowerment"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 via-primary-700/85 to-purple-800/90" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-40 left-20 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl animate-pulse delay-700" />
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-yellow-500/20 rounded-full blur-xl animate-pulse delay-500" />
        
        {/* Content */}
        <div className="relative z-10 p-12 flex flex-col justify-between text-white">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-16 group">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <span className="text-2xl font-bold">SaahasSetu</span>
                <span className="text-sm block text-white/70">Secure Workplace</span>
              </div>
            </Link>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm">Join 50,000+ empowered women</span>
              </div>
              
              <h1 className="text-5xl font-bold leading-tight">
                Your Journey to a<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-yellow-300">
                  Safer Workplace
                </span>
                <br />Starts Here
              </h1>
              
              <p className="text-lg text-white/80 max-w-md">
                Create your secure account and join thousands of women who have 
                found their voice through SaahasSetu.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: "End-to-End Encryption" },
                { icon: Heart, label: "24/7 Support" },
                { icon: CheckCircle, label: "PoSH Compliant" },
                { icon: Star, label: "Certified Counselors" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-colors"
                >
                  <item.icon className="w-5 h-5 text-pink-300" />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                  alt="User"
                  width={48}
                  height={48}
                  className="rounded-full ring-2 ring-white/30"
                />
                <div>
                  <p className="font-medium">Priya M.</p>
                  <p className="text-sm text-white/70">Mumbai</p>
                </div>
                <div className="ml-auto flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-white/90 italic">
                "SaahasSetu gave me the courage to speak up. The platform is 
                incredibly secure and the support team was with me every step."
              </p>
            </div>

            <p className="text-sm text-white/60">
              Need immediate help? Call{" "}
              <a href="tel:181" className="font-bold text-white hover:underline">
                181
              </a>{" "}
              (Women Helpline - 24/7)
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-3 justify-center">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  SaahasSetu
                </span>
                <span className="text-xs block text-gray-500">Secure Workplace</span>
              </div>
            </Link>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                    step >= s
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                  )}
                >
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 2 && (
                  <div
                    className={cn(
                      "w-16 h-1 rounded-full transition-all duration-300",
                      step > s
                        ? "bg-gradient-to-r from-primary-500 to-primary-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {step === 1 ? "Create Your Account" : "Complete Your Profile"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {step === 1 ? "Choose your role to get started" : "Just a few more details"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {step === 1 ? (
              <>
                {/* Role Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    I am a...
                  </label>
                  {userRoles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 text-left group",
                        selectedRole === role.id
                          ? "border-primary-500 bg-gradient-to-r from-primary-50 to-rose-50 dark:from-primary-900/30 dark:to-rose-900/30 shadow-lg shadow-primary-500/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
                      )}
                    >
                      <div
                        className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300",
                          selectedRole === role.id
                            ? `bg-gradient-to-r ${role.gradient} text-white shadow-lg`
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:scale-105"
                        )}
                      >
                        <role.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p
                          className={cn(
                            "font-semibold transition-colors",
                            selectedRole === role.id
                              ? "text-primary-600"
                              : "text-gray-900 dark:text-white"
                          )}
                        >
                          {role.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {role.description}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                          selectedRole === role.id
                            ? "border-primary-500 bg-primary-500"
                            : "border-gray-300 dark:border-gray-600"
                        )}
                      >
                        {selectedRole === role.id && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined as any });
                  }}
                  leftIcon={<Mail className="w-5 h-5" />}
                  error={fieldErrors.email}
                  required
                />
                <Input
                  label="Phone Number (Optional)"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  leftIcon={<Phone className="w-5 h-5" />}
                  helperText="Used for OTP login and emergency contact"
                />
              </>
            ) : (
              <>
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined as any });
                  }}
                  leftIcon={<User className="w-5 h-5" />}
                  error={fieldErrors.name}
                  required
                />

                {(selectedRole === "admin" || selectedRole === "partner") && (
                  <Input
                    label="Organization Name"
                    type="text"
                    placeholder="Your organization"
                    value={formData.organization}
                    onChange={(e) => {
                      setFormData({ ...formData, organization: e.target.value });
                      if (fieldErrors.organization) setFieldErrors({ ...fieldErrors, organization: undefined as any });
                    }}
                    leftIcon={<Building2 className="w-5 h-5" />}
                    error={fieldErrors.organization}
                    required
                  />
                )}

                <div>
                  <Input
                    label="Create Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined as any });
                    }}
                    leftIcon={<Lock className="w-5 h-5" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="focus:outline-none hover:text-primary-500 transition-colors"
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
                  {/* Password strength indicator */}
                  {formData.password.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {passwordChecks.map((check, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {check.test(formData.password) ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-gray-300" />
                          )}
                          <span className={cn(
                            "text-xs",
                            check.test(formData.password)
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-400 dark:text-gray-500"
                          )}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      });
                      if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: undefined as any });
                    }}
                    leftIcon={<Lock className="w-5 h-5" />}
                    error={fieldErrors.confirmPassword}
                    required
                  />
                  {formData.confirmPassword.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      {passwordsMatch ? (
                        <><CheckCircle className="w-3.5 h-3.5 text-green-500" /><span className="text-xs text-green-600 dark:text-green-400">Passwords match</span></>
                      ) : (
                        <><AlertCircle className="w-3.5 h-3.5 text-red-400" /><span className="text-xs text-red-500">Passwords do not match</span></>
                      )}
                    </div>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          acceptTerms: e.target.checked,
                        })
                      }
                      className={cn(
                        "mt-1 w-5 h-5 rounded text-primary-600 focus:ring-primary-500",
                        fieldErrors.terms ? "border-red-500" : "border-gray-300"
                      )}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary-600 font-medium hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary-600 font-medium hover:underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {fieldErrors.terms && (
                    <p className="text-xs text-red-500 -mt-2 ml-8">{fieldErrors.terms}</p>
                  )}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.acceptPrivacy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          acceptPrivacy: e.target.checked,
                        })
                      }
                      className={cn(
                        "mt-1 w-5 h-5 rounded text-primary-600 focus:ring-primary-500",
                        fieldErrors.privacy ? "border-red-500" : "border-gray-300"
                      )}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                      I understand my data is encrypted and protected under Indian IT laws
                    </span>
                  </label>
                  {fieldErrors.privacy && (
                    <p className="text-xs text-red-500 -mt-2 ml-8">{fieldErrors.privacy}</p>
                  )}
                </div>
              </>
            )}

            <div className="flex gap-3">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                  leftIcon={<ArrowLeft className="w-5 h-5" />}
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                className={cn(
                  "flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/30 transition-all duration-300",
                  step === 1 ? "w-full" : ""
                )}
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                {step === 1 ? "Continue" : "Create Account"}
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary-600 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>

          {/* Emergency Link */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <a
              href="tel:181"
              className="flex items-center justify-center gap-2 text-rose-500 hover:text-rose-600 transition-colors group"
            >
              <Phone className="w-4 h-4 group-hover:animate-pulse" />
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

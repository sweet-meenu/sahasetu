import {
  Shield,
  Lock,
  Eye,
  Heart,
  Scale,
  Users,
  FileText,
  MessageCircle,
  Building2,
  Phone,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Globe,
  Clock,
  Award,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";

const features = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description:
      "Your reports and evidence are encrypted at all times. Only authorized personnel can access them.",
    color: "text-primary-600",
    bg: "bg-primary-100",
  },
  {
    icon: Eye,
    title: "Anonymous Reporting",
    description:
      "Choose to report without revealing your identity. Your safety comes first.",
    color: "text-secondary-600",
    bg: "bg-secondary-100",
  },
  {
    icon: Heart,
    title: "24/7 Counseling Support",
    description:
      "Connect with certified counselors anytime via chat or call with voice distortion.",
    color: "text-accent-600",
    bg: "bg-accent-100",
  },
  {
    icon: Scale,
    title: "PoSH Act Compliant",
    description:
      "Platform fully compliant with the Sexual Harassment of Women at Workplace Act, 2013.",
    color: "text-info",
    bg: "bg-blue-100",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Assistance",
    description:
      "Get help writing professional reports and organizing evidence with our AI tools.",
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    icon: Users,
    title: "Partner & Committee Access",
    description:
      "Connect with registered Partners and Internal Committees directly through the platform.",
    color: "text-green-600",
    bg: "bg-green-100",
  },
];

const services = [
  {
    icon: FileText,
    title: "Incident Reporting",
    description:
      "Document incidents securely with AI-assisted narrative writing and evidence management.",
    href: "/dashboard/report",
  },
  {
    icon: Lock,
    title: "Evidence Vault",
    description:
      "Store documents, audio, and images in an encrypted digital locker with controlled access.",
    href: "/dashboard/evidence",
  },
  {
    icon: MessageCircle,
    title: "Counseling Support",
    description:
      "Get emotional and legal support from certified counselors via chat or voice call.",
    href: "/dashboard/counseling",
  },
  {
    icon: Building2,
    title: "Partner & Legal Access",
    description:
      "Find and connect with Partners, legal bodies, and Internal Committees near you.",
    href: "/dashboard/partners",
  },
];

const stats = [
  { value: "100%", label: "Privacy Protected" },
  { value: "24/7", label: "Support Available" },
  { value: "50+", label: "Partner Partners" },
  { value: "10+", label: "Languages Supported" },
];

const testimonials = [
  {
    quote:
      "This platform gave me the courage to speak up. The anonymous reporting feature made all the difference.",
    author: "Anonymous User",
    role: "IT Professional",
  },
  {
    quote:
      "The AI helped me articulate what happened professionally. I felt supported throughout the process.",
    author: "Anonymous User",
    role: "Healthcare Worker",
  },
  {
    quote:
      "Finally, a platform that truly prioritizes women's safety and privacy. The counseling support was invaluable.",
    author: "Anonymous User",
    role: "Education Sector",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-200 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-8">
              <Shield className="w-4 h-4" />
              <span>PoSH Act 2013 Compliant Platform</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Your Voice Matters.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">
                Your Safety
              </span>{" "}
              is Our Priority.
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              A secure, privacy-first platform for reporting workplace
              harassment. Report safely, get support, and protect your rights
              — all while maintaining complete anonymity.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  Report Securely
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Learn About PoSH
                </Button>
              </Link>
            </div>

            {/* Emergency Helpline */}
            <div className="mt-10 inline-flex items-center gap-3 px-6 py-3 bg-error/10 border border-error/20 rounded-xl">
              <Phone className="w-5 h-5 text-error" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Emergency? Call{" "}
                <a
                  href="tel:181"
                  className="font-bold text-error hover:underline"
                >
                  181
                </a>{" "}
                (Women Helpline) or{" "}
                <a
                  href="tel:100"
                  className="font-bold text-error hover:underline"
                >
                  100
                </a>{" "}
                (Police)
              </span>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
              className="dark:fill-gray-900"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-900 -mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary-600">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How We Protect You
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built with privacy and security at the core, our platform ensures
              your information stays safe.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="group">
                <CardContent>
                  <div
                    className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive support at every step of your journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <Link key={index} href={service.href}>
                <Card hover className="h-full group">
                  <CardContent className="flex gap-4">
                    <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-600 transition-colors">
                      <service.icon className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        {service.title}
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {service.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto">
              Simple, secure, and supportive — every step of the way
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                icon: Users,
                title: "Create Account",
                description: "Sign up securely with phone or email",
              },
              {
                step: "02",
                icon: FileText,
                title: "Report Incident",
                description: "Document with AI assistance, anonymously if needed",
              },
              {
                step: "03",
                icon: Lock,
                title: "Secure Evidence",
                description: "Upload and encrypt all supporting evidence",
              },
              {
                step: "04",
                icon: Heart,
                title: "Get Support",
                description: "Connect with counselors, Partners, or committees",
              },
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-primary-400/30" />
                )}
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-4">
                  <item.icon className="w-8 h-8" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-white text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-primary-100 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Women Across India
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Real stories from real users (identities protected)
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardContent>
                  <div className="text-4xl text-primary-200 mb-4">"</div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                    {testimonial.quote}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-2 text-gray-500">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm font-medium">PoSH Act Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Award className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium">ISO 27001 Certified</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Globe className="w-5 h-5 text-info" />
              <span className="text-sm font-medium">10+ Languages</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-5 h-5 text-secondary-500" />
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            You Are Not Alone. We Are Here to Help.
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            Take the first step towards justice and peace of mind. Your
            identity is protected, your voice is heard, and your rights are
            defended.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                Start Reporting Safely
              </Button>
            </Link>
            <a href="tel:181">
              <Button
                variant="outline"
                size="lg"
                leftIcon={<Phone className="w-5 h-5" />}
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-gray-900"
              >
                Call Helpline: 181
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

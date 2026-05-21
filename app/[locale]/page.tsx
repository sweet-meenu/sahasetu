"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";
import { Navbar, Footer } from "@/components/layout";

export default function Home() {
  const t = useTranslations();

  const features = [
    {
      icon: Lock,
      title: t("features.secureReporting"),
      description: t("features.secureReportingDesc"),
      color: "text-primary-600",
      bg: "bg-primary-100",
    },
    {
      icon: Eye,
      title: t("features.evidenceVault"),
      description: t("features.evidenceVaultDesc"),
      color: "text-secondary-600",
      bg: "bg-secondary-100",
    },
    {
      icon: Heart,
      title: t("features.expertCounseling"),
      description: t("features.expertCounselingDesc"),
      color: "text-accent-600",
      bg: "bg-accent-100",
    },
    {
      icon: Scale,
      title: t("features.legalSupport"),
      description: t("features.legalSupportDesc"),
      color: "text-info",
      bg: "bg-blue-100",
    },
    {
      icon: Sparkles,
      title: t("features.caseTracking"),
      description: t("features.caseTrackingDesc"),
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      icon: Users,
      title: t("features.multiLanguage"),
      description: t("features.multiLanguageDesc"),
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  const services = [
    {
      icon: FileText,
      title: t("nav.reportIncident"),
      description: t("features.secureReportingDesc"),
      href: "/dashboard/report",
    },
    {
      icon: Lock,
      title: t("nav.evidenceVault"),
      description: t("features.evidenceVaultDesc"),
      href: "/dashboard/evidence",
    },
    {
      icon: MessageCircle,
      title: t("nav.counseling"),
      description: t("features.expertCounselingDesc"),
      href: "/dashboard/counseling",
    },
    {
      icon: Building2,
      title: t("nav.partners"),
      description: t("features.legalSupportDesc"),
      href: "/dashboard/partners",
    },
  ];

  const stats = [
    { value: "1,200+", label: t("landing.casesReported") },
    { value: "950+", label: t("landing.casesResolved") },
    { value: "150+", label: t("landing.organizationsRegistered") },
    { value: "5,000+", label: t("landing.supportSessions") },
  ];

  const testimonials = [
    {
      quote: t("features.secureReportingDesc"),
      author: t("common.safeHer"),
      role: t("common.secureWorkplace"),
    },
    {
      quote: t("features.expertCounselingDesc"),
      author: t("common.safeHer"),
      role: t("common.secureWorkplace"),
    },
    {
      quote: t("features.legalSupportDesc"),
      author: t("common.safeHer"),
      role: t("common.secureWorkplace"),
    },
  ];

  const howItWorksSteps = [
    {
      step: "01",
      icon: Users,
      title: t("common.getStarted"),
      description: t("auth.signUpSubtitle"),
    },
    {
      step: "02",
      icon: FileText,
      title: t("nav.reportIncident"),
      description: t("report.subtitle"),
    },
    {
      step: "03",
      icon: Lock,
      title: t("nav.evidenceVault"),
      description: t("evidence.subtitle"),
    },
    {
      step: "04",
      icon: Heart,
      title: t("counseling.title"),
      description: t("counseling.subtitle"),
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.35, 0.2],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-200 rounded-full blur-3xl"
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-8"
                >
                  <Shield className="w-4 h-4" />
                  <span>{t("common.safeHer")} - {t("common.secureWorkplace")}</span>
                </motion.div>

                {/* Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6"
                >
                  {t("landing.heroTitle")}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">
                    {t("landing.heroTitleHighlight")}
                  </span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10"
                >
                  {t("landing.heroSubtitle")}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
                >
                  <Link href="/register">
                    <Button
                      size="lg"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      className="w-full sm:w-auto shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow"
                    >
                      {t("landing.reportNow")}
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      {t("common.learnMore")}
                    </Button>
                  </Link>
                </motion.div>

                {/* Emergency Helpline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-10 inline-flex items-center gap-3 px-6 py-3 bg-error/10 border border-error/20 rounded-xl"
                >
                  <Phone className="w-5 h-5 text-error animate-pulse" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t("common.emergencyHelpline")}:{" "}
                    <a
                      href="tel:181"
                      className="font-bold text-error hover:underline"
                    >
                      181
                    </a>{" "}
                    ({t("support.womenHelpline")}) or{" "}
                    <a
                      href="tel:100"
                      className="font-bold text-error hover:underline"
                    >
                      100
                    </a>{" "}
                    ({t("support.policeHelpline")})
                  </span>
                </motion.div>
              </motion.div>

              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="hidden lg:block relative"
              >
                <div className="relative">
                  <Image
                    src="/xdwomen.jpg"
                    alt="Empowered Woman"
                    width={500}
                    height={600}
                    className="rounded-3xl shadow-2xl object-cover"
                  />
                  {/* Floating Cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="absolute -left-8 top-20 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Lock className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t("features.secureReporting")}</p>
                        <p className="text-xs text-gray-500">{t("common.secureWorkplace")}</p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="absolute -right-8 bottom-32 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t("common.emergencyHelpline")}</p>
                        <p className="text-xs text-gray-500">{t("common.callNow")}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
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
                {t("landing.featuresTitle")}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t("landing.featuresSubtitle")}
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
                {t("nav.resources")}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t("landing.featuresSubtitle")}
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
                {t("landing.statsTitle")}
              </h2>
              <p className="text-lg text-primary-100 max-w-2xl mx-auto">
                {t("landing.statsSubtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {howItWorksSteps.map((item, index) => (
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
                {t("landing.testimonialsTitle")}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {t("landing.testimonialsSubtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="relative">
                  <CardContent>
                    <div className="text-4xl text-primary-200 mb-4">&quot;</div>
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
                <span className="text-sm font-medium">{t("features.legalSupport")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Award className="w-5 h-5 text-warning" />
                <span className="text-sm font-medium">{t("features.secureReporting")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Globe className="w-5 h-5 text-info" />
                <span className="text-sm font-medium">{t("features.multiLanguage")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-5 h-5 text-secondary-500" />
                <span className="text-sm font-medium">{t("common.emergencyHelpline")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {t("landing.ctaTitle")}
            </h2>
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
              {t("landing.ctaSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  {t("common.getStarted")}
                </Button>
              </Link>
              <a href="tel:181">
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<Phone className="w-5 h-5" />}
                  className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-gray-900"
                >
                  {t("common.callNow")}: 181
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

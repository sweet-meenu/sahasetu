"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Video,
  Mail,
  MapPin,
  Clock,
  Heart,
  Shield,
  Users,
  HeadphonesIcon,
  Building2,
  Globe,
  ChevronRight,
  Send,
  CheckCircle,
  Star,
  ArrowRight,
  Mic,
  MicOff,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const supportOptions = [
  {
    icon: Phone,
    title: "24/7 Helpline",
    description: "Speak to a trained counselor anytime",
    action: "Call Now",
    href: "tel:181",
    color: "bg-red-500",
    highlight: true,
  },
  {
    icon: MessageCircle,
    title: "Chat Support",
    description: "Anonymous text-based counseling",
    action: "Start Chat",
    href: "/dashboard/counseling",
    color: "bg-blue-500",
  },
  {
    icon: Video,
    title: "Video Counseling",
    description: "Face-to-face sessions with experts",
    action: "Book Session",
    href: "/dashboard/counseling",
    color: "bg-purple-500",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help via secure email",
    action: "Write to Us",
    href: "#contact",
    color: "bg-green-500",
  },
];

const counselors = [
  {
    name: "Dr. Meera Patel",
    specialization: "Trauma & Recovery Specialist",
    experience: "15+ years",
    languages: ["English", "Hindi", "Gujarati"],
    rating: 4.9,
    sessions: 2450,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    available: true,
  },
  {
    name: "Sunita Krishnan",
    specialization: "Women's Rights Advocate",
    experience: "12+ years",
    languages: ["English", "Hindi", "Telugu"],
    rating: 4.8,
    sessions: 1890,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face",
    available: true,
  },
  {
    name: "Priya Sharma",
    specialization: "Legal & Emotional Counselor",
    experience: "10+ years",
    languages: ["English", "Hindi", "Marathi"],
    rating: 4.9,
    sessions: 1560,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    available: false,
  },
  {
    name: "Dr. Anjali Mehta",
    specialization: "Clinical Psychologist",
    experience: "18+ years",
    languages: ["English", "Hindi"],
    rating: 5.0,
    sessions: 3200,
    image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=200&h=200&fit=crop&crop=face",
    available: true,
  },
];

const partners = [
  {
    name: "Women's Rights Foundation",
    type: "Partner",
    services: ["Legal Aid", "Counseling", "Shelter"],
    location: "Mumbai, Maharashtra",
    phone: "+91 22 1234 5678",
    verified: true,
  },
  {
    name: "Shakti Support Center",
    type: "Partner",
    services: ["Emergency Support", "Rehabilitation"],
    location: "Delhi NCR",
    phone: "+91 11 2345 6789",
    verified: true,
  },
  {
    name: "Mahila Sahayata Kendra",
    type: "Government",
    services: ["Legal Help", "Medical Aid", "Police Liaison"],
    location: "Pan India",
    phone: "181",
    verified: true,
  },
];

const features = [
  {
    icon: Shield,
    title: "100% Confidential",
    description: "Your identity and conversations are completely protected",
  },
  {
    icon: Mic,
    title: "Voice Distortion",
    description: "Optional voice masking for audio/video calls",
  },
  {
    icon: Clock,
    title: "24/7 Available",
    description: "Support available round the clock, every day",
  },
  {
    icon: Globe,
    title: "Multi-language",
    description: "Get support in 10+ Indian languages",
  },
];

export default function SupportPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary-600 via-secondary-700 to-teal-800 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-20 right-10 w-80 h-80 bg-primary-400 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                <span>You Are Not Alone</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Get Support & Counseling
              </h1>
              <p className="text-xl text-secondary-100 mb-8">
                Connect with certified counselors, Partners, and support services. 
                We're here to listen, support, and help you through every step.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="tel:181">
                  <Button
                    size="lg"
                    className="bg-white text-secondary-700 hover:bg-white/90"
                    leftIcon={<Phone className="w-5 h-5" />}
                  >
                    Call Helpline: 181
                  </Button>
                </a>
                <Link href="/dashboard/counseling">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10"
                    leftIcon={<MessageCircle className="w-5 h-5" />}
                  >
                    Start Chat
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Support Options Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {supportOptions.map((option, index) => (
                <motion.a
                  key={option.title}
                  href={option.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={cn(
                    "p-5 rounded-2xl backdrop-blur-sm transition-all",
                    option.highlight
                      ? "bg-white text-gray-900 shadow-xl"
                      : "bg-white/10 hover:bg-white/20"
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                      option.highlight ? option.color : "bg-white/20"
                    )}
                  >
                    <option.icon
                      className={cn(
                        "w-6 h-6",
                        option.highlight ? "text-white" : "text-white"
                      )}
                    />
                  </div>
                  <h3
                    className={cn(
                      "font-semibold mb-1",
                      option.highlight ? "text-gray-900" : "text-white"
                    )}
                  >
                    {option.title}
                  </h3>
                  <p
                    className={cn(
                      "text-sm mb-3",
                      option.highlight ? "text-gray-500" : "text-white/70"
                    )}
                  >
                    {option.description}
                  </p>
                  <span
                    className={cn(
                      "text-sm font-medium flex items-center gap-1",
                      option.highlight ? "text-primary-600" : "text-white"
                    )}
                  >
                    {option.action}
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-gray-50 dark:fill-gray-900"
            />
          </svg>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-white dark:bg-gray-800 py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                  <feature.icon className="w-5 h-5 text-secondary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {feature.title}
                  </p>
                  <p className="text-xs text-gray-500">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Counselors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full text-sm font-medium mb-4">
              <HeadphonesIcon className="w-4 h-4" />
              <span>Professional Support</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Counselors
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our team of certified counselors are trained in trauma-informed care 
              and are here to support you with compassion and expertise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {counselors.map((counselor, index) => (
              <motion.div
                key={counselor.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full overflow-hidden group">
                  <div className="relative">
                    <div className="h-32 bg-gradient-to-br from-primary-500 to-secondary-500" />
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                      <div className="relative">
                        <Image
                          src={counselor.image}
                          alt={counselor.name}
                          width={96}
                          height={96}
                          className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                        />
                        {counselor.available && (
                          <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-14 text-center">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {counselor.name}
                    </h3>
                    <p className="text-sm text-primary-600 mb-2">
                      {counselor.specialization}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      {counselor.experience} experience
                    </p>
                    <div className="flex items-center justify-center gap-1 mb-3">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{counselor.rating}</span>
                      <span className="text-xs text-gray-400">
                        ({counselor.sessions.toLocaleString()} sessions)
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1 mb-4">
                      {counselor.languages.map((lang) => (
                        <Badge key={lang} variant="default" size="sm">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant={counselor.available ? "primary" : "outline"}
                      size="sm"
                      className="w-full"
                      disabled={!counselor.available}
                    >
                      {counselor.available ? "Book Session" : "Currently Busy"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Partners & Support Organizations */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-8">
              <span className="w-10 h-1 bg-secondary-500 rounded-full" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Partner Organizations
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-secondary-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {partner.name}
                            </h3>
                            <Badge variant="secondary" size="sm">
                              {partner.type}
                            </Badge>
                          </div>
                        </div>
                        {partner.verified && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {partner.services.map((service) => (
                          <span
                            key={service}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {partner.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {partner.phone}
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4" size="sm">
                        Contact Organization
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/dashboard/partners">
                <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View All Partner Organizations
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full text-sm font-medium mb-4">
              <Mail className="w-4 h-4" />
              <span>Get In Touch</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Send Us a Message
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Have questions or need help? Fill out the form and our support team 
              will get back to you within 24 hours.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <Phone className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                  <p className="text-gray-500">+91 11 2345 6789</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <Mail className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email</p>
                  <p className="text-gray-500">support@sahasetu.org</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <Clock className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Response Time
                  </p>
                  <p className="text-gray-500">Within 24 hours</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-8">
                {formSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-gray-500">
                      We'll get back to you within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setFormSubmitted(true);
                    }}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input label="Name" placeholder="Your name" required />
                      <Input
                        label="Email"
                        type="email"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <Input label="Phone (Optional)" type="tel" placeholder="+91" />
                    <Select
                      label="Subject"
                      options={[
                        { value: "", label: "Select a topic" },
                        { value: "general", label: "General Inquiry" },
                        { value: "counseling", label: "Counseling Request" },
                        { value: "legal", label: "Legal Help" },
                        { value: "technical", label: "Technical Support" },
                        { value: "feedback", label: "Feedback" },
                      ]}
                    />
                    <Textarea
                      label="Message"
                      placeholder="How can we help you?"
                      rows={4}
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      rightIcon={<Send className="w-5 h-5" />}
                    >
                      Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              In Immediate Danger?
            </h2>
            <p className="text-red-100 mb-6 max-w-2xl mx-auto">
              If you are in immediate danger, please call emergency services immediately.
              Your safety is the top priority.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:181"
                className="flex items-center gap-2 px-8 py-4 bg-white text-red-600 rounded-xl font-bold text-xl hover:bg-red-50 transition-colors"
              >
                <Phone className="w-6 h-6" />
                Women Helpline: 181
              </a>
              <a
                href="tel:100"
                className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-xl transition-colors"
              >
                <Phone className="w-6 h-6" />
                Police: 100
              </a>
              <a
                href="tel:112"
                className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-xl transition-colors"
              >
                <Phone className="w-6 h-6" />
                Emergency: 112
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

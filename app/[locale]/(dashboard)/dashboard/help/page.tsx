"use client";

import { useState } from "react";
import {
  HelpCircle,
  Search,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Book,
  Scale,
  Shield,
  AlertCircle,
  Clock,
  Users,
  Headphones,
  CheckCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is the PoSH Act 2013?",
        a: "The Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 is a legislative act in India that seeks to protect women from sexual harassment at their place of work. It mandates the constitution of an Internal Complaints Committee (ICC) in organizations with more than 10 employees.",
      },
      {
        q: "Who can file a complaint on this platform?",
        a: "Any woman who has faced sexual harassment at the workplace can file a complaint. This includes employees, interns, contractors, and visitors. You can also file on behalf of someone with their consent.",
      },
      {
        q: "Is my identity protected on this platform?",
        a: "Yes, your identity is completely protected. You can choose to remain anonymous, and all your data is encrypted using military-grade AES-256 encryption. Only authorized personnel can access your information with your consent.",
      },
    ],
  },
  {
    category: "Filing a Complaint",
    questions: [
      {
        q: "How do I file a complaint?",
        a: 'Navigate to the "File Incident Report" section in your dashboard. Follow the step-by-step wizard to provide details about the incident. You can save drafts and add evidence at any time.',
      },
      {
        q: "What evidence should I include?",
        a: "You can include any relevant evidence such as text messages, emails, audio/video recordings, photos, witness statements, or any other documentation that supports your complaint. All evidence is stored in an encrypted vault.",
      },
      {
        q: "Can I edit my complaint after submission?",
        a: "You can add additional information or evidence to your complaint after submission, but the original content cannot be edited to maintain integrity. Any additions will be timestamped and logged.",
      },
    ],
  },
  {
    category: "Privacy & Security",
    questions: [
      {
        q: "How is my data protected?",
        a: "Your data is protected using end-to-end encryption (AES-256), secure servers, and strict access controls. We follow GDPR and Indian data protection guidelines. Regular security audits ensure your information remains safe.",
      },
      {
        q: "Who can see my complaints?",
        a: "Only you and the ICC/authorities you choose to share with can see your complaints. Our AI assistants process data without storing personally identifiable information.",
      },
      {
        q: "Can my employer see my activity on this platform?",
        a: "No, your employer cannot see your activity on this platform. We do not share any information with employers unless you explicitly choose to file a formal complaint through your organization's ICC.",
      },
    ],
  },
  {
    category: "Counseling",
    questions: [
      {
        q: "Are counseling sessions confidential?",
        a: "Absolutely. All counseling sessions are completely confidential. Counselors are bound by professional ethics and legal obligations to maintain confidentiality. Sessions can also use voice distortion for added privacy.",
      },
      {
        q: "What if I need help outside of counseling hours?",
        a: "Our SOS chatbot is available 24/7 for immediate support. You can also call the Women Helpline (181) or access emergency resources through the platform at any time.",
      },
    ],
  },
];

const resources = [
  {
    title: "PoSH Act 2013 - Full Text",
    description: "Official legislative document of the Sexual Harassment of Women at Workplace Act",
    icon: Scale,
    url: "https://legislative.gov.in/sites/default/files/A2013-14.pdf",
  },
  {
    title: "Filing a Complaint - Guide",
    description: "Official step-by-step booklet guide to filing an effective workplace complaint",
    icon: FileText,
    url: "https://shebox.wcd.gov.in/assets/site/main/images/She-box_booklet.pdf",
  },
  {
    title: "Know Your Rights - Handbook",
    description: "Understanding employee rights and ICC structures under the PoSH Act",
    icon: Shield,
    url: "https://wcd.nic.in/act/handbook-sexual-harassment-women-workplace",
  },
  {
    title: "Workplace Safety Handbook",
    description: "Comprehensive national guide to preventative workplace safety for women",
    icon: Book,
    url: "https://www.wcd.nic.in/sites/default/files/Handbook%20on%20Sexual%20Harassment%20at%20Workplace.pdf",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  // Contact support states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleContactSubmit() {
    if (!email || !topic || !message) {
      setSubmitError("Please fill out your Email, Topic, and Message.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic, message }),
      });
      if (res.ok) {
        setSubmitSuccess("Your support request was submitted successfully! Our ICC response team will follow up within 24 hours.");
        setName("");
        setEmail("");
        setTopic("");
        setMessage("");
      } else {
        const errData = await res.json();
        setSubmitError(errData.error || "Failed to submit request.");
      }
    } catch (err) {
      setSubmitError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(
      (category) =>
        (activeCategory === "all" || category.category === activeCategory) &&
        (searchQuery === "" || category.questions.length > 0)
    );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-primary-600" />
          Help & Support
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Find answers, resources, and get support
        </p>
      </div>

      {/* Quick Contact */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">Chat Support</p>
              <p className="text-sm text-primary-100">Available 24/7</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white border-0">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">Phone Support</p>
              <a href="tel:181" className="text-sm text-secondary-100 hover:underline">
                Call 181
              </a>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent-500 to-accent-600 text-white border-0">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">Email Support</p>
              <p className="text-sm text-accent-100">support@sahasetu.org</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
          className="max-w-xl"
        />
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h2>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeCategory === "all"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
            )}
          >
            All
          </button>
          {faqs.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                activeCategory === cat.category
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
              )}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* FAQ Accordions */}
        <div className="space-y-6">
          {filteredFaqs.map(
            (category) =>
              category.questions.length > 0 && (
                <div key={category.category}>
                  {activeCategory === "all" && (
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {category.category}
                    </h3>
                  )}
                  <div className="space-y-2">
                    {category.questions.map((faq, index) => {
                      const faqId = `${category.category}-${index}`;
                      const isExpanded = expandedFaq === faqId;
                      return (
                        <Card key={faqId}>
                          <button
                            onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                            className="w-full p-4 flex items-start justify-between text-left"
                          >
                            <span className="font-medium text-gray-900 dark:text-white pr-4">
                              {faq.q}
                            </span>
                            <ChevronDown
                              className={cn(
                                "w-5 h-5 text-gray-400 shrink-0 transition-transform",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4">
                              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {faq.a}
                              </p>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )
          )}
        </div>
      </div>

      {/* Resources */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Resources & Guides
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {resources.map((resource, index) => (
            <Card key={index} hover className="group cursor-pointer">
              <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <resource.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-500">{resource.description}</p>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-primary-600" />
            Contact Support
          </CardTitle>
          <CardDescription>
            Can&apos;t find what you&apos;re looking for? Send us a message.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Your Name (Optional)"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Select
            label="Topic"
            options={[
              { value: "", label: "Select a topic" },
              { value: "technical", label: "Technical Issue" },
              { value: "account", label: "Account Help" },
              { value: "privacy", label: "Privacy Concern" },
              { value: "report", label: "Report Assistance" },
              { value: "other", label: "Other" },
            ]}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
          <Textarea
            label="Message"
            placeholder="Describe your issue or question..."
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          {submitError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900 text-sm flex gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-900 text-sm flex gap-2">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{submitSuccess}</span>
            </div>
          )}

          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-info shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              For emergencies, please call the Women Helpline at <strong>181</strong> or use the SOS button in the bottom right corner.
            </p>
          </div>
          <Button onClick={handleContactSubmit} disabled={submitting} className="cursor-pointer">
            {submitting ? "Sending Ticket..." : "Send Message"}
          </Button>
        </CardContent>
      </Card>

      {/* Response Time */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Clock className="w-4 h-4" />
        Average response time: <span className="font-medium">Within 24 hours</span>
      </div>
    </div>
  );
}

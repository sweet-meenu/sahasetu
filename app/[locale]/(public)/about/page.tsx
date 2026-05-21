import {
  Scale,
  Shield,
  FileText,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Building2,
  Briefcase,
  Home,
  Phone,
  BookOpen,
  Gavel,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const poshHighlights = [
  {
    title: "Applies to All Workplaces",
    description:
      "Covers both organized and unorganized sectors, including domestic workers",
    icon: Building2,
  },
  {
    title: "Internal Complaints Committee",
    description:
      "Mandatory for organizations with 10+ employees to constitute an ICC",
    icon: Users,
  },
  {
    title: "90-Day Filing Window",
    description:
      "Complaints must be filed within 3 months of the incident (extendable)",
    icon: Clock,
  },
  {
    title: "Confidentiality Protected",
    description:
      "Identity of the complainant, respondent, and witnesses must be kept confidential",
    icon: Shield,
  },
];

const whatConstitutesHarassment = [
  "Physical contact and advances",
  "Demand or request for sexual favours",
  "Making sexually coloured remarks",
  "Showing pornography",
  "Any other unwelcome physical, verbal or non-verbal conduct of sexual nature",
  "Promise or threat in connection with employment",
  "Humiliating treatment affecting health/safety",
  "Creating hostile work environment",
];

const yourRights = [
  {
    title: "Right to File a Complaint",
    description:
      "You can file a written complaint with the ICC or LCC within 3 months of the incident.",
    icon: FileText,
  },
  {
    title: "Right to Confidentiality",
    description:
      "Your identity and the contents of the complaint must be kept confidential.",
    icon: Shield,
  },
  {
    title: "Right to Fair Inquiry",
    description:
      "The inquiry must be completed within 90 days with proper opportunity to be heard.",
    icon: Scale,
  },
  {
    title: "Right to Interim Relief",
    description:
      "You can request transfer, leave, or other interim measures during the inquiry.",
    icon: Clock,
  },
  {
    title: "Right to Appeal",
    description:
      "You can appeal against the findings or recommendations within 90 days.",
    icon: Gavel,
  },
  {
    title: "Right to Legal Action",
    description:
      "You have the right to file a criminal complaint under IPC Section 354A.",
    icon: Briefcase,
  },
];

const faqs = [
  {
    question: "Who can file a complaint under the PoSH Act?",
    answer:
      "Any woman who is employed at a workplace, whether directly or through an agent, including temporary, contract, ad-hoc, or daily wage workers. The Act covers all women, including interns and volunteers.",
  },
  {
    question: "What is the time limit for filing a complaint?",
    answer:
      "The complaint must be filed within 3 months from the date of the incident. However, the ICC can extend this period by another 3 months if there is a valid reason for the delay.",
  },
  {
    question: "Can I file an anonymous complaint?",
    answer:
      "While the PoSH Act requires a written complaint, our platform allows you to document incidents anonymously until you're ready to file formally. Your identity remains protected throughout.",
  },
  {
    question: "What happens after I file a complaint?",
    answer:
      "The ICC must complete the inquiry within 90 days. During this time, you can request interim relief such as transfer or leave. The committee will then submit its report and recommendations.",
  },
  {
    question: "What if my employer doesn't have an ICC?",
    answer:
      "If your employer has fewer than 10 employees, you can file a complaint with the Local Complaints Committee (LCC) set up by the District Officer. We can help you find the nearest LCC.",
  },
  {
    question: "Will I face retaliation for filing a complaint?",
    answer:
      "The PoSH Act prohibits retaliation against complainants. Any adverse action taken against you for filing a complaint is itself a violation that can be reported.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="primary" className="mb-4">
              <Scale className="w-4 h-4 mr-1" />
              PoSH Act 2013
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Know Your Rights Under the{" "}
              <span className="text-primary-600">PoSH Act</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              The Sexual Harassment of Women at Workplace (Prevention,
              Prohibition and Redressal) Act, 2013 provides protection against
              sexual harassment at the workplace and ensures a safe working
              environment for every woman.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Report an Incident
                </Button>
              </Link>
              <a
                href="https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  leftIcon={<BookOpen className="w-5 h-5" />}
                >
                  Read Full Act
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PoSH Act Overview */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Understanding the PoSH Act
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Key provisions of the Sexual Harassment of Women at Workplace Act,
              2013
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {poshHighlights.map((item, index) => (
              <Card key={index} className="text-center">
                <CardContent>
                  <div className="w-14 h-14 mx-auto bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What Constitutes Harassment */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="warning" className="mb-4">
                <AlertCircle className="w-4 h-4 mr-1" />
                Important
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                What Constitutes Sexual Harassment?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Under Section 2(n) of the PoSH Act, sexual harassment includes
                any of the following unwelcome acts or behavior:
              </p>
              <ul className="space-y-3">
                {whatConstitutesHarassment.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-primary-600 text-white rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-4">
                Workplace Coverage
              </h3>
              <p className="text-primary-100 mb-6">
                The Act defines "workplace" very broadly to include:
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: Building2,
                    text: "Government & private sector organizations",
                  },
                  { icon: Briefcase, text: "Partners, trusts, and societies" },
                  { icon: Home, text: "Domestic workers' employers" },
                  {
                    icon: Users,
                    text: "Any place visited by employee during employment",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Rights Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="success" className="mb-4">
              <Shield className="w-4 h-4 mr-1" />
              Your Rights
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Rights of Women Under PoSH Act
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              You have strong legal protections. Know your rights and exercise
              them.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {yourRights.map((right, index) => (
              <Card key={index} hover>
                <CardContent>
                  <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl flex items-center justify-center mb-4">
                    <right.icon className="w-6 h-6 text-secondary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {right.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {right.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="info" className="mb-4">
              <HelpCircle className="w-4 h-4 mr-1" />
              FAQs
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need Help? We're Here for You
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            If you've experienced workplace harassment, you don't have to face
            it alone. Our platform provides secure reporting, evidence
            management, and connects you with support services.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100 w-full sm:w-auto"
              >
                Report an Incident
              </Button>
            </Link>
            <a href="tel:181">
              <Button
                variant="outline"
                size="lg"
                leftIcon={<Phone className="w-5 h-5" />}
                className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
              >
                Women Helpline: 181
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

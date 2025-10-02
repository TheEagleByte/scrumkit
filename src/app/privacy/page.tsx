import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy - ScrumKit",
  description: "Privacy Policy for ScrumKit - Learn how we collect, use, and protect your data in our open-source scrum ceremony tools platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6 -ml-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last Updated: October 2, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-lg text-muted-foreground">
              ScrumKit is an open-source platform for scrum ceremony tools including retrospectives,
              planning poker, daily standups, and team health checks. This Privacy Policy explains
              how information is collected, used, and protected when you use ScrumKit.
            </p>
            <p className="text-lg text-muted-foreground">
              <strong>Important:</strong> ScrumKit is designed to be self-hosted, meaning you can
              deploy it on your own infrastructure. When self-hosting, you have full control over
              your data and are responsible for your own privacy and security practices.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>

            <h3 className="text-xl font-semibold mb-3">Account Information</h3>
            <p className="text-muted-foreground mb-4">
              When you create an account, we collect:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Email address (required for account creation and authentication)</li>
              <li>Full name (optional, for display purposes)</li>
              <li>Password (encrypted and stored securely)</li>
              <li>OAuth provider data (if you sign in with Google or GitHub)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Usage Data</h3>
            <p className="text-muted-foreground mb-4">
              When you use ScrumKit, we may collect:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Retrospective board data (cards, votes, action items)</li>
              <li>Planning poker session data (estimates, stories)</li>
              <li>Team and organization information</li>
              <li>Session information and authentication tokens</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Cookies and Tracking</h3>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Authentication and session management</li>
              <li>Remembering your preferences</li>
              <li>Analytics (when enabled by the instance administrator)</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Provide the Service:</strong> Enable retrospectives, planning poker sessions, and other scrum ceremony tools</li>
              <li><strong>Maintain Security:</strong> Protect your account and prevent unauthorized access</li>
              <li><strong>Communicate:</strong> Send important updates about your account or sessions (if email notifications are enabled)</li>
              <li><strong>Improve the Platform:</strong> Analyze usage patterns to enhance features and user experience</li>
              <li><strong>Enable Collaboration:</strong> Allow team members to work together in real-time</li>
            </ul>
          </section>

          {/* Data Storage & Security */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Data Storage & Security</h2>

            <h3 className="text-xl font-semibold mb-3">Storage Infrastructure</h3>
            <p className="text-muted-foreground mb-4">
              ScrumKit uses Supabase (built on PostgreSQL) for data storage. When self-hosting:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>You control where your data is stored (your own infrastructure or cloud provider)</li>
              <li>You are responsible for database backups and disaster recovery</li>
              <li>You determine data retention policies</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Security Measures</h3>
            <p className="text-muted-foreground mb-4">
              ScrumKit implements several security measures:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Passwords are hashed and encrypted using industry-standard algorithms</li>
              <li>Row Level Security (RLS) policies ensure users can only access their own data</li>
              <li>HTTPS encryption for data in transit (when properly configured)</li>
              <li>OAuth 2.0 for secure third-party authentication</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Data Retention</h3>
            <p className="text-muted-foreground">
              When self-hosting, you control data retention policies. We recommend implementing
              regular backups and establishing clear data retention guidelines for your organization.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Your Rights (GDPR & CCPA Compliance)</h2>
            <p className="text-muted-foreground mb-4">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li><strong>Right to Access:</strong> You can view and export your account information and activity data</li>
              <li><strong>Right to Rectification:</strong> You can update or correct your personal information through your profile settings</li>
              <li><strong>Right to Erasure:</strong> You can request deletion of your account and associated data</li>
              <li><strong>Right to Data Portability:</strong> You can export your data in a machine-readable format</li>
              <li><strong>Right to Object:</strong> You can object to processing of your personal data for certain purposes</li>
              <li><strong>Right to Withdraw Consent:</strong> You can withdraw consent for data processing at any time</li>
            </ul>
            <p className="text-muted-foreground">
              When self-hosting, the instance administrator is responsible for honoring these rights.
              For hosted instances, contact your administrator to exercise these rights.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
            <p className="text-muted-foreground mb-4">
              ScrumKit integrates with the following third-party services:
            </p>

            <h3 className="text-xl font-semibold mb-3">Supabase</h3>
            <p className="text-muted-foreground mb-4">
              Used for database, authentication, and real-time functionality. When self-hosting,
              you can use your own Supabase instance or a managed Supabase service.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Privacy Policy: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">https://supabase.com/privacy</a></li>
              <li>Security: <a href="https://supabase.com/security" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">https://supabase.com/security</a></li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">OAuth Providers</h3>
            <p className="text-muted-foreground mb-4">
              When you sign in with Google or GitHub, those providers may collect data according
              to their privacy policies:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Google OAuth: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">Google Privacy Policy</a></li>
              <li>GitHub OAuth: <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">GitHub Privacy Statement</a></li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Analytics (Optional)</h3>
            <p className="text-muted-foreground">
              Instance administrators may optionally enable analytics services (such as Vercel Analytics).
              When enabled, these services collect anonymized usage data to help improve the platform.
              Check with your instance administrator about what analytics are enabled.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookie Policy</h2>
            <p className="text-muted-foreground mb-4">
              ScrumKit uses the following types of cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality (cannot be disabled)</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Analytics Cookies:</strong> Track usage patterns (optional, can be disabled by instance administrator)</li>
            </ul>
            <p className="text-muted-foreground">
              You can control cookies through your browser settings, but disabling essential cookies
              may prevent you from using certain features of ScrumKit.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground mb-4">
              ScrumKit does not sell or rent your personal information. We only share data in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li><strong>Within Your Team:</strong> Data you create in retrospectives and planning poker sessions is shared with your team members</li>
              <li><strong>Service Providers:</strong> Third-party services that help operate the platform (Supabase, OAuth providers)</li>
              <li><strong>Legal Requirements:</strong> If required by law, court order, or government regulation</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets (for hosted services)</li>
            </ul>
            <p className="text-muted-foreground">
              When self-hosting, you control all data sharing decisions for your instance.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
            <p className="text-muted-foreground">
              When self-hosting, you choose where your data is stored and processed. For hosted instances,
              data may be transferred to and processed in countries other than your own. These countries may
              have different data protection laws. We ensure appropriate safeguards are in place for
              international transfers in accordance with GDPR and other applicable regulations.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">
              ScrumKit is intended for professional use and is not designed for children under 13 years of age.
              We do not knowingly collect personal information from children under 13. If you become aware that
              a child has provided us with personal information, please contact the instance administrator.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for
              legal, operational, or regulatory reasons. When self-hosting, you can customize this policy to
              meet your organization&apos;s specific needs and requirements.
            </p>
            <p className="text-muted-foreground mt-4">
              We will notify users of any material changes by updating the &quot;Last Updated&quot; date at the top of
              this policy. Continued use of ScrumKit after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions or concerns about this Privacy Policy or how your data is handled:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li><strong>For Self-Hosted Instances:</strong> Contact your instance administrator</li>
              <li><strong>For ScrumKit Project:</strong> Open an issue on <a href="https://github.com/TheEagleByte/scrumkit/issues" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">GitHub</a></li>
              <li><strong>Email:</strong> Create an issue for privacy-related concerns on our repository</li>
            </ul>
          </section>

          {/* Open Source Notice */}
          <section className="border-t border-border pt-8 mt-8">
            <h2 className="text-2xl font-semibold mb-4">Open Source Notice</h2>
            <p className="text-muted-foreground">
              ScrumKit is open-source software released under the MIT License. The source code is available on
              <a href="https://github.com/TheEagleByte/scrumkit" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline ml-1">GitHub</a>.
              When you self-host ScrumKit, you have complete control over your data and privacy practices.
              This Privacy Policy serves as a template and guideline, but you should customize it to reflect
              your specific implementation and jurisdiction requirements.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

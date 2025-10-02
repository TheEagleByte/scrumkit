import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service - ScrumKit",
  description: "Terms of Service for ScrumKit - Learn about user responsibilities, acceptable use, and service terms for our open-source scrum ceremony tools platform.",
};

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last Updated: October 2, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-lg text-muted-foreground">
              Welcome to ScrumKit, an open-source platform for scrum ceremony tools including
              retrospectives, planning poker, daily standups, and team health checks. These Terms
              of Service (&quot;Terms&quot;) govern your use of ScrumKit and constitute a legally binding
              agreement between you and the ScrumKit project.
            </p>
            <p className="text-lg text-muted-foreground">
              <strong>Important:</strong> ScrumKit is designed to be self-hosted, meaning you can
              deploy it on your own infrastructure. When self-hosting, you are responsible for
              complying with these Terms and all applicable laws in your jurisdiction.
            </p>
          </section>

          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing, installing, or using ScrumKit, you agree to be bound by these Terms
              of Service, our Privacy Policy, and all applicable laws and regulations. If you do
              not agree with any of these terms, you are prohibited from using or accessing this
              software.
            </p>
            <p className="text-muted-foreground mb-4">
              These Terms apply to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Users of hosted ScrumKit instances</li>
              <li>Organizations and individuals who self-host ScrumKit</li>
              <li>Contributors to the ScrumKit open-source project</li>
              <li>Any person or entity that downloads, modifies, or distributes the software</li>
            </ul>
          </section>

          {/* 2. Description of Service */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>

            <h3 className="text-xl font-semibold mb-3">What ScrumKit Provides</h3>
            <p className="text-muted-foreground mb-4">
              ScrumKit is a comprehensive platform for agile teams that provides:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li><strong>Retrospective Boards:</strong> Collaborative boards for team retrospectives with voting and action items</li>
              <li><strong>Planning Poker:</strong> Story estimation sessions with customizable voting sequences</li>
              <li><strong>Daily Standups:</strong> Tools for coordinating daily team check-ins</li>
              <li><strong>Team Health Checks:</strong> Periodic team health assessments and tracking</li>
              <li><strong>Real-time Collaboration:</strong> Live updates and synchronization across team members</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Open-Source Nature</h3>
            <p className="text-muted-foreground mb-4">
              ScrumKit is released under the MIT License and is free and open-source software (FOSS).
              The source code is publicly available on <a href="https://github.com/TheEagleByte/scrumkit" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">GitHub</a>.
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Use the software for any purpose</li>
              <li>Study and modify the source code</li>
              <li>Distribute copies of the original or modified software</li>
              <li>Contribute improvements back to the project</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Self-Hosting Options</h3>
            <p className="text-muted-foreground">
              ScrumKit is designed to be self-hosted. You can deploy it on your own infrastructure,
              cloud provider, or use a managed hosting service. When self-hosting, you are responsible
              for server maintenance, security, backups, and compliance with applicable laws.
            </p>
          </section>

          {/* 3. User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>

            <h3 className="text-xl font-semibold mb-3">Account Creation Requirements</h3>
            <p className="text-muted-foreground mb-4">
              To use certain features of ScrumKit, you must create an account. When creating an account:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>You must provide accurate and complete information</li>
              <li>You must be at least 13 years of age</li>
              <li>You must have authorization to bind your organization (if registering on behalf of an organization)</li>
              <li>You must not impersonate any person or entity</li>
              <li>You must not create multiple accounts for disruptive or deceptive purposes</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Account Security Responsibilities</h3>
            <p className="text-muted-foreground mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Maintaining the confidentiality of your password and account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying the instance administrator immediately of any unauthorized access</li>
              <li>Using strong, unique passwords and enabling two-factor authentication when available</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Account Termination</h3>
            <p className="text-muted-foreground">
              Accounts may be terminated or suspended for violations of these Terms, including but
              not limited to: abusive behavior, security violations, illegal activity, or violation
              of acceptable use policies. You may also delete your own account at any time through
              your account settings.
            </p>
          </section>

          {/* 4. Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>

            <h3 className="text-xl font-semibold mb-3">Prohibited Activities</h3>
            <p className="text-muted-foreground mb-4">
              You agree not to use ScrumKit to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Violate any local, state, national, or international law or regulation</li>
              <li>Infringe upon or violate the intellectual property rights of others</li>
              <li>Harass, abuse, threaten, or intimidate any person</li>
              <li>Distribute spam, malware, viruses, or other malicious code</li>
              <li>Attempt to gain unauthorized access to systems, networks, or user accounts</li>
              <li>Interfere with or disrupt the integrity or performance of the service</li>
              <li>Collect or store personal data about other users without consent</li>
              <li>Use automated systems (bots, scrapers) without authorization</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Content Restrictions</h3>
            <p className="text-muted-foreground mb-4">
              Content created within ScrumKit (retrospective items, action items, comments, etc.) must not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Contain illegal, defamatory, obscene, or offensive material</li>
              <li>Violate any third-party rights, including privacy, publicity, or intellectual property rights</li>
              <li>Contain confidential information without proper authorization</li>
              <li>Promote illegal activities or violence</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Compliance with Laws</h3>
            <p className="text-muted-foreground">
              You are responsible for ensuring your use of ScrumKit complies with all applicable laws,
              including but not limited to data protection laws (GDPR, CCPA), export control laws,
              and industry-specific regulations applicable to your organization.
            </p>
          </section>

          {/* 5. Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>

            <h3 className="text-xl font-semibold mb-3">MIT License Terms</h3>
            <p className="text-muted-foreground mb-4">
              ScrumKit is licensed under the MIT License. The full license text:
            </p>
            <div className="bg-muted/20 border border-border rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground font-mono">
                Permission is hereby granted, free of charge, to any person obtaining a copy
                of this software and associated documentation files (the &quot;Software&quot;), to deal
                in the Software without restriction, including without limitation the rights
                to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                copies of the Software, and to permit persons to whom the Software is
                furnished to do so, subject to the following conditions:
              </p>
              <p className="text-sm text-muted-foreground font-mono mt-4">
                The above copyright notice and this permission notice shall be included in all
                copies or substantial portions of the Software.
              </p>
            </div>

            <h3 className="text-xl font-semibold mb-3">User-Generated Content Ownership</h3>
            <p className="text-muted-foreground mb-4">
              You retain all rights to content you create within ScrumKit (retrospective items,
              action items, comments, etc.). When self-hosting, all user data remains under your
              control and ownership. By using the service, you grant:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Your team members access to view and collaborate on shared content</li>
              <li>The instance administrator access necessary to maintain and operate the service</li>
              <li>A non-exclusive license to process and store your content as necessary to provide the service</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Trademark Usage</h3>
            <p className="text-muted-foreground">
              &quot;ScrumKit&quot; and related logos are trademarks of the ScrumKit project. You may not use
              these trademarks without permission, except as necessary to accurately describe your
              use of the software (e.g., &quot;powered by ScrumKit&quot;).
            </p>
          </section>

          {/* 6. Disclaimers & Limitations */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Disclaimers & Limitations of Liability</h2>

            <h3 className="text-xl font-semibold mb-3">&quot;As-Is&quot; Service Provision</h3>
            <p className="text-muted-foreground mb-4">
              ScrumKit is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without any warranties, express or
              implied. We do not warrant that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>The service will be uninterrupted, secure, or error-free</li>
              <li>The results obtained from using the service will be accurate or reliable</li>
              <li>Any errors in the software will be corrected</li>
              <li>The service will meet your specific requirements</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">No Warranty</h3>
            <p className="text-muted-foreground mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WE DISCLAIM ALL WARRANTIES,
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Implied warranties of merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Title</li>
              <li>Quiet enjoyment</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Limitation of Liability</h3>
            <p className="text-muted-foreground mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE SCRUMKIT
              PROJECT, CONTRIBUTORS, OR COPYRIGHT HOLDERS BE LIABLE FOR ANY:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Direct, indirect, incidental, special, consequential, or exemplary damages</li>
              <li>Loss of profits, revenue, data, use, or goodwill</li>
              <li>Business interruption or loss of business opportunity</li>
              <li>Personal injury or property damage</li>
              <li>Cost of procurement of substitute goods or services</li>
            </ul>
            <p className="text-muted-foreground">
              This limitation applies regardless of the legal theory (contract, tort, negligence,
              strict liability, or otherwise) and even if we have been advised of the possibility
              of such damages.
            </p>
          </section>

          {/* 7. Modifications to Terms */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Modifications to Terms</h2>

            <h3 className="text-xl font-semibold mb-3">Right to Update Terms</h3>
            <p className="text-muted-foreground mb-4">
              We reserve the right to modify these Terms of Service at any time. When changes are made:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>We will update the &quot;Last Updated&quot; date at the top of this page</li>
              <li>Material changes will be communicated through the GitHub repository</li>
              <li>Continued use of ScrumKit after changes constitutes acceptance of the updated Terms</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Notification Process</h3>
            <p className="text-muted-foreground mb-4">
              For significant changes to these Terms, we will:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Post an announcement in the GitHub repository</li>
              <li>Update the changelog with details of the changes</li>
              <li>Provide reasonable advance notice when possible</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Self-Hosted Instances</h3>
            <p className="text-muted-foreground">
              When self-hosting, you may customize these Terms to meet your organization&apos;s specific
              needs and legal requirements. However, you must comply with the MIT License terms for
              the software itself.
            </p>
          </section>

          {/* 8. Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Governing Law and Dispute Resolution</h2>

            <h3 className="text-xl font-semibold mb-3">Jurisdiction</h3>
            <p className="text-muted-foreground mb-4">
              These Terms shall be governed by and construed in accordance with the laws of your
              jurisdiction, without regard to its conflict of law provisions. When self-hosting,
              you should consult with legal counsel to determine the appropriate governing law for
              your instance.
            </p>

            <h3 className="text-xl font-semibold mb-3">Dispute Resolution</h3>
            <p className="text-muted-foreground mb-4">
              Any disputes arising from these Terms or your use of ScrumKit should be resolved through:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li><strong>Informal Resolution:</strong> Contact the instance administrator or project maintainers first</li>
              <li><strong>Mediation:</strong> Good faith attempts at mediation before pursuing legal action</li>
              <li><strong>Arbitration:</strong> Binding arbitration if required by your jurisdiction</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Severability</h3>
            <p className="text-muted-foreground">
              If any provision of these Terms is found to be unenforceable or invalid, that provision
              will be limited or eliminated to the minimum extent necessary, and the remaining provisions
              will remain in full force and effect.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions or concerns about these Terms of Service:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li><strong>For Self-Hosted Instances:</strong> Contact your instance administrator</li>
              <li><strong>For ScrumKit Project:</strong> Open an issue on <a href="https://github.com/TheEagleByte/scrumkit/issues" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">GitHub</a></li>
              <li><strong>Email:</strong> Create an issue for legal or terms-related concerns on our repository</li>
            </ul>
          </section>

          {/* Open Source Notice */}
          <section className="border-t border-border pt-8 mt-8">
            <h2 className="text-2xl font-semibold mb-4">Open Source Notice</h2>
            <p className="text-muted-foreground">
              ScrumKit is open-source software released under the MIT License. The source code is available on
              <a href="https://github.com/TheEagleByte/scrumkit" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline ml-1">GitHub</a>.
              When you self-host ScrumKit, you have the freedom to customize and modify the software
              to meet your needs. These Terms of Service serve as a template and guideline, but you
              should customize them to reflect your specific implementation and jurisdiction requirements.
            </p>
            <p className="text-muted-foreground mt-4">
              The MIT License grants you broad permissions, but you are responsible for ensuring your
              use of the software complies with all applicable laws and regulations in your jurisdiction.
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

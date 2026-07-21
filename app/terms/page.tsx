import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              ← Back to Home
            </Button>
          </Link>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-foreground">Terms of Service</h1>
          <p className="mt-2 text-muted-foreground">
            Last updated: <span className="font-num">{new Date().toLocaleDateString("en-US")}</span>
          </p>
        </div>

        <div className="space-y-8 rounded-card border border-border bg-card p-8">
          <section>
            <h2 className="mb-4 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
              Agreement to Terms
            </h2>
            <p className="text-foreground leading-relaxed">
              By accessing or using StudySync, you agree to be bound by these Terms of Service. If you do not agree to
              these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
              Description of Service
            </h2>
            <p className="text-foreground leading-relaxed">
              StudySync is a student collaboration platform that helps groups manage projects, assignments, and tasks.
              We provide features including group management, assignment tracking, AI-powered work planning, file
              sharing, and optional Google Classroom integration.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
              Eligibility
            </h2>
            <p className="text-foreground leading-relaxed">
              You must be at least 13 years old to use StudySync. By using our service, you represent that you meet this
              age requirement and have the authority to accept these terms.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
              User Accounts
            </h2>
            <div className="space-y-4 text-foreground">
              <p className="leading-relaxed">When you create an account, you agree to:</p>
              <ul className="list-inside list-disc space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
              Google Classroom Integration
            </h2>
            <div className="space-y-4 text-foreground">
              <p className="leading-relaxed">When you connect Google Classroom:</p>
              <ul className="list-inside list-disc space-y-2">
                <li>You grant us read-only access to your courses and assignments</li>
                <li>We will not modify or delete any data in Google Classroom</li>
                <li>You can disconnect at any time from your account settings</li>
                <li>Your imported data will be deleted when you disconnect</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
              Acceptable Use
            </h2>
            <div className="space-y-4 text-foreground">
              <p className="leading-relaxed">You agree NOT to:</p>
              <ul className="list-inside list-disc space-y-2">
                <li>Use the service for any illegal purpose</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Upload malicious code or viruses</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Share inappropriate or offensive content</li>
                <li>Impersonate others or misrepresent your affiliation</li>
                <li>Scrape or collect data from the platform without permission</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
              User Content
            </h2>
            <p className="mb-4 text-foreground leading-relaxed">
              You retain ownership of content you create on StudySync. By using our service, you grant us a license to
              store, display, and process your content to provide the service.
            </p>
            <p className="text-foreground leading-relaxed">
              You are responsible for the content you share in groups. Do not share confidential, copyrighted, or
              inappropriate material without proper authorization.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
              Intellectual Property
            </h2>
            <p className="text-foreground leading-relaxed">
              StudySync and its original content, features, and functionality are owned by us and protected by
              international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
              AI Features
            </h2>
            <p className="text-foreground leading-relaxed">
              Our AI-powered features (work planner, task assistant, source recommendations) are provided as-is. AI
              suggestions should be reviewed and verified by you. We are not responsible for the accuracy or
              completeness of AI-generated content.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
              Service Availability
            </h2>
            <p className="text-foreground leading-relaxed">
              We strive to keep StudySync available 24/7, but we do not guarantee uninterrupted access. We may suspend
              or terminate the service for maintenance, updates, or other reasons without liability.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
              Disclaimer of Warranties
            </h2>
            <p className="text-foreground leading-relaxed">
              StudySync is provided "as is" without warranties of any kind, either express or implied. We do not warrant
              that the service will be error-free, secure, or meet your specific requirements.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
              Limitation of Liability
            </h2>
            <p className="text-foreground leading-relaxed">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or
              consequential damages arising from your use of StudySync, including lost data, lost profits, or project
              failures.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
              Account Termination
            </h2>
            <p className="mb-4 text-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account if you violate these terms or engage in abusive
              behavior. You may delete your account at any time from your profile settings.
            </p>
            <p className="text-foreground leading-relaxed">
              Upon termination, your access to the service will cease, and your data will be deleted according to our
              Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
              Changes to Terms
            </h2>
            <p className="text-foreground leading-relaxed">
              We may modify these Terms of Service at any time. We will notify users of significant changes via email or
              through the platform. Continued use after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">
              Governing Law
            </h2>
            <p className="text-foreground leading-relaxed">
              These terms are governed by and construed in accordance with applicable laws, without regard to conflict
              of law principles.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-[17px] font-medium tracking-[-0.01em] text-foreground">Contact</h2>
            <p className="text-foreground leading-relaxed">
              For questions about these Terms of Service, contact us at{" "}
              <a href="mailto:support@studysync.click" className="text-accent-fg hover:underline">
                support@studysync.click
              </a>
            </p>
          </section>

          <section className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              By using StudySync, you acknowledge that you have read, understood, and agree to be bound by these Terms
              of Service and our Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

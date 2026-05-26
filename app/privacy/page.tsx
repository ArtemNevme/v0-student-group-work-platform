import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              ← Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8 rounded-lg bg-white p-8 shadow-sm">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              StudySync ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how
              we collect, use, and safeguard your information when you use our student collaboration platform.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-800">Account Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  When you create an account, we collect your email address, name, and password (encrypted).
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-800">Google Account Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you sign in with Google, we receive your name, email address, and profile picture from Google.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-800">Google Classroom Data</h3>
                <p className="text-gray-700 leading-relaxed">
                  When you connect Google Classroom, we access and store your courses and assignments in read-only mode.
                  We do not modify or delete any data in Google Classroom.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-800">Usage Data</h3>
                <p className="text-gray-700 leading-relaxed">
                  We collect information about how you use StudySync, including groups you create, assignments you
                  manage, and tasks you complete.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">How We Use Your Information</h2>
            <ul className="list-inside list-disc space-y-2 text-gray-700">
              <li>To provide and maintain the StudySync platform</li>
              <li>To enable collaboration features between group members</li>
              <li>To import and display your Google Classroom assignments</li>
              <li>To send notifications about group activities and assignments</li>
              <li>To improve our services and develop new features</li>
              <li>To communicate with you about updates and support</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Google Classroom Integration</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              StudySync's use of information received from Google APIs will adhere to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We only request read-only access to your Google Classroom courses and assignments. We do not:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-2 text-gray-700">
              <li>Create, modify, or delete any data in Google Classroom</li>
              <li>Share your Google Classroom data with third parties</li>
              <li>Use your data for advertising purposes</li>
              <li>Store more data than necessary to provide the service</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Data Sharing</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We do not sell your personal information. We only share data with:
            </p>
            <ul className="list-inside list-disc space-y-2 text-gray-700">
              <li>
                <strong>Group Members:</strong> Information you add to shared groups is visible to other group members
              </li>
              <li>
                <strong>Service Providers:</strong> We use Supabase for database and authentication, and Vercel for
                hosting
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to protect our rights
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement industry-standard security measures including encryption, secure authentication, and Row
              Level Security (RLS) policies to protect your data. However, no method of transmission over the internet
              is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Your Rights</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">You have the right to:</p>
            <ul className="list-inside list-disc space-y-2 text-gray-700">
              <li>Access and download your data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Disconnect Google Classroom integration at any time</li>
              <li>Revoke Google OAuth permissions through your Google Account settings</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your data for as long as your account is active. When you delete your account, we permanently
              remove your personal information within 30 days. Google Classroom data is deleted immediately when you
              disconnect the integration.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              StudySync is intended for students 13 years and older. We do not knowingly collect information from
              children under 13. If you believe we have collected information from a child under 13, please contact us
              immediately.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by email or
              through a notice on our platform.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this Privacy Policy or how we handle your data, please contact us at{" "}
              <a href="mailto:privacy@studysync.click" className="text-blue-600 hover:underline">
                privacy@studysync.click
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

# ReviewGrowth AI — MVP scaffold

Multi-business customer feedback and review-management SaaS starter built with Next.js, TypeScript, Tailwind CSS, Supabase and Gemini.

## Included
- Responsive dashboard UI with demo metrics and sample feedback.
- Public QR feedback route at /feedback/[slug].
- Supabase-backed feedback submission API.
- Gemini AI review-writing assistant that uses only facts supplied by the customer.
- Initial multi-tenant PostgreSQL schema and RLS policies.
- Supabase browser and server client helpers.

## Run locally
1. Install Node.js 22 or later.
2. Copy .env.example to .env.local and fill in Supabase credentials.
3. Run supabase/migrations/0001_initial_schema.sql in the Supabase SQL editor.
4. Add GEMINI_API_KEY to enable AI suggestions.
5. Run npm install, then npm run dev.
6. Open http://localhost:3000.

## Environment
See .env.example. Never commit .env.local, Gemini keys, Google OAuth secrets, Razorpay secrets or Supabase service-role keys.

## Not yet connected
- Authentication and business onboarding.
- Live database-backed dashboard (dashboard currently uses demo data).
- Google Business Profile OAuth, review sync and owner replies.
- WhatsApp/email notifications and Razorpay subscriptions.
- Production rate limiting, CAPTCHA, monitoring and full security testing.

## Review integrity
Collect honest feedback from every customer. Do not hide or divert negative feedback to manipulate ratings. AI may help customers express their own real experience, but must not invent facts, sentiment, keywords or claims. Customers must approve and submit reviews themselves; the app does not auto-publish reviews.

## Before production
Add tenant authorization to every data operation, test RLS across separate businesses, encrypt Google OAuth tokens server-side, implement abuse protection and privacy/data-retention workflows, and verify Google Business Profile API access and quotas.
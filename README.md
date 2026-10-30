# ReviewGrowth AI

AI-powered review management and local SEO SaaS MVP.

## Source bundle

The complete Next.js MVP source, Supabase SQL migration, API routes, UI and setup files are included in [`reviewgrowth-ai-source.zip`](./reviewgrowth-ai-source.zip). Download and extract the archive to work with the project.

## Stack

- Next.js and TypeScript
- Tailwind CSS
- Supabase / PostgreSQL
- Gemini API integration scaffold

## Local setup

1. Extract `reviewgrowth-ai-source.zip`.
2. Run `npm install` in the extracted `reviewgrowth-ai` directory.
3. Copy `.env.example` to `.env.local` and add your own credentials.
4. Apply `supabase/migrations/0001_initial_schema.sql` to your Supabase project.
5. Run `npm run dev`.

Never commit API keys, service-role keys, or production secrets. The MVP is a development scaffold; verify integrations and security before production deployment.

## Review policy

The product supports collecting feedback from all customers and helping customers express their own genuine experiences. It must not filter who is invited to review, fabricate reviews, or automatically publish reviews on a customer's behalf.

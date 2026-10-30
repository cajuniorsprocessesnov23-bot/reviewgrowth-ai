import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
const schema = z.object({ locationSlug: z.string().min(2).max(100), rating: z.number().int().min(1).max(5), message: z.string().trim().min(8).max(3000), customerName: z.string().trim().max(120).optional().default(''), customerEmail: z.union([z.string().email(), z.literal('')]).optional().default('') });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Please check the feedback details and try again.' }, { status: 400 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: 'Feedback storage is not configured yet.' }, { status: 503 });
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: location, error: locationError } = await supabase.from('locations').select('id,business_id,google_review_url').eq('public_slug', parsed.data.locationSlug).eq('is_active', true).maybeSingle();
  if (locationError || !location) return NextResponse.json({ error: 'This feedback link is not active.' }, { status: 404 });
  const { error } = await supabase.from('feedback').insert({ business_id: location.business_id, location_id: location.id, rating: parsed.data.rating, message: parsed.data.message, customer_name: parsed.data.customerName || null, customer_email: parsed.data.customerEmail || null, source: 'qr', status: parsed.data.rating <= 3 ? 'needs_attention' : 'new' });
  if (error) return NextResponse.json({ error: 'We could not save your feedback. Please try again.' }, { status: 500 });
  return NextResponse.json({ success: true, googleReviewUrl: location.google_review_url || '' });
}

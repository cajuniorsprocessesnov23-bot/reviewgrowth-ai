import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
export async function GET() {
 const db = await createSupabaseServerClient();
 const { data: { user }, error } = await db.auth.getUser();
 if (error || !user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
 const { data: membership, error: membershipError } = await db.from('business_members').select('business_id,role,businesses(id,name,slug)').eq('user_id', user.id).limit(1).maybeSingle();
 if (membershipError) return NextResponse.json({ error: 'Could not verify business access.' }, { status: 500 });
 if (!membership) return NextResponse.json({ error: 'No business workspace is linked to this account. Complete business setup first.' }, { status: 403 });
 return NextResponse.json({ membership });
}
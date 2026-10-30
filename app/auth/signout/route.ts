import {NextResponse} from 'next/server';
import {createSupabaseServerClient} from '@/lib/supabase/server';
export async function POST(request:Request){const db=await createSupabaseServerClient();await db.auth.signOut();return NextResponse.redirect(new URL('/business/login',request.url));}

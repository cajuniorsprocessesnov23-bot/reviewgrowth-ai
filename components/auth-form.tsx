'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Mode = 'business-login' | 'business-register' | 'team-login';
export default function AuthForm({ mode }: { mode: Mode }) {
 const router = useRouter();
 const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
 const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [notice,setNotice]=useState('');
 const register=mode==='business-register'; const team=mode==='team-login';
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');setNotice('');
  try { const supabase=createSupabaseBrowserClient();
   if(register){const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name,account_type:'business'},emailRedirectTo:window.location.origin+'/auth/callback?next=%2Fbusiness%2Fonboarding'}});if(error)throw error;if(!data.session){setNotice('Account created. Verify your email, then sign in to finish business setup.');return;}router.push('/business/onboarding');router.refresh();return;}
   const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;
   const check=await fetch(team?'/api/team/access':'/api/business/access');const result=await check.json();if(!check.ok){await supabase.auth.signOut();throw new Error(result.error||'This account does not have access to this portal.');}
   router.push(team?'/team':'/business/dashboard');router.refresh();
  } catch(err){setError(err instanceof Error?err.message:'Authentication failed.');} finally{setBusy(false);}
 }
 return <main className="auth-shell"><section className="auth-card"><Link href="/" className="auth-brand"><span>B</span><b>branditudegrowth<span>ai</span></b></Link><div className="auth-eyebrow">{team?'INTERNAL ACCESS':register?'START YOUR BUSINESS WORKSPACE':'BUSINESS PORTAL'}</div><h1>{team?'Team sign in':register?'Create your business account':'Welcome back'}</h1><p className="auth-sub">{team?'Authorized Branditude Business Growth AI personnel only.':register?'Register your business to manage customer feedback, locations and growth.':'Sign in to manage your customer experience workspace.'}</p>
 <form onSubmit={submit}>{register&&<label>Full name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"/></label>}<label>Work email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@business.com" autoComplete="email"/></label><label>Password<input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={register?'new-password':'current-password'}/></label>
 {error&&<div className="auth-error">{error}</div>}{notice&&<div className="auth-notice">{notice}</div>}<button className="auth-submit" disabled={busy}>{busy?'Please wait…':register?'Create business account':'Sign in'}</button></form>
 {!team&&<div className="auth-switch">{register?<>Already registered? <Link href="/business/login">Sign in</Link></>:<>New to Branditude Business Growth AI? <Link href="/business/register">Register your business</Link></>}</div>}
 <div className="auth-foot">{team?<Link href="/business/login">Business login</Link>:<Link href="/team/login">Internal team access</Link>}<span>Secure access · Branditude Business Growth AI</span></div></section></main>;
}
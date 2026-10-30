import { NextResponse } from 'next/server';
import { z } from 'zod';
const schema = z.object({ businessName: z.string().trim().min(1).max(120), businessType: z.string().trim().min(1).max(80), customerExperience: z.string().trim().min(8).max(1500), language: z.enum(['English', 'Hindi', 'Marathi']).default('English') });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Provide the business type and the customer’s actual experience.' }, { status: 400 });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'AI is not configured. Add GEMINI_API_KEY to the server environment.' }, { status: 503 });
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const prompt = `Help the customer express their own real experience. Business: ${parsed.data.businessName} (${parsed.data.businessType}). Actual experience: ${parsed.data.customerExperience}. Language: ${parsed.data.language}. Return JSON with follow_up_questions (3 questions), draft_options (2 concise first-person drafts using ONLY facts supplied; do not invent claims, locations, products, keywords or praise), and missing_details (optional facts to add only if true). Never pressure positive sentiment or imply a review is required. Customer must edit/approve and post themselves.`;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.45 } }) });
    const payload = await response.json();
    if (!response.ok) return NextResponse.json({ error: 'The AI provider could not complete the request.' }, { status: 502 });
    const raw = payload?.candidates?.[0]?.content?.parts?.map((part: {text?:string}) => part.text || '').join('') || '{}';
    try { return NextResponse.json({ result: JSON.parse(raw), disclaimer: 'Optional AI drafts. Customers must ensure every statement is accurate and submit any Google review themselves.' }); }
    catch { return NextResponse.json({ error: 'AI returned an unreadable response. Please try again.' }, { status: 502 }); }
  } catch { return NextResponse.json({ error: 'Could not reach the AI provider.' }, { status: 502 }); }
}

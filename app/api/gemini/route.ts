import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash';

const buildPrompt = () => [
  'You are extracting receipt data. Return ONLY valid JSON.',
  'Fields: merchant, amount (number), date (string), category, flagged (boolean), flagReason (string or null), location (string or null).',
  'If a field is unknown, use null (except amount should be 0).',
  'Do not include markdown, code fences, or extra text.'
].join(' ');

const extractJson = (text: string) => {
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) return null;
  const jsonText = cleaned.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
};

export async function POST(req: Request) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY.' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file upload.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type || 'application/octet-stream';

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: buildPrompt() },
              { inlineData: { mimeType, data: base64 } }
            ]
          }
        ]
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: payload?.error?.message || 'Gemini request failed.' }, { status: response.status });
    }

    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const data = extractJson(text);

    if (!data) {
      return NextResponse.json({ error: 'Gemini did not return valid JSON.' }, { status: 422 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

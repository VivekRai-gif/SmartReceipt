import { NextResponse } from 'next/server';

const WEBHOOK_URL = 'https://shubhjhack.app.n8n.cloud/webhook/41e79a9c-14aa-4e3d-8582-f673cf132eb9';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file upload.' }, { status: 400 });
    }

    const forwardForm = new FormData();
    forwardForm.append('file', file, file.name);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: forwardForm,
    });

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json({ error: text || 'Webhook request failed.' }, { status: response.status });
    }

    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

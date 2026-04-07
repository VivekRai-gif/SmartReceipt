import { NextResponse } from 'next/server';

const WEBHOOK_URL = 'https://shubhjhack.app.n8n.cloud/webhook/Expense-tracker';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file upload.' }, { status: 400 });
    }

    const sendToWebhook = async (fieldName: string) => {
      const forwardForm = new FormData();
      forwardForm.append(fieldName, file, file.name);
      forwardForm.append('filename', file.name);
      forwardForm.append('contentType', file.type || 'application/octet-stream');

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: forwardForm,
      });

      const text = await response.text();
      return { response, text };
    };

    const primary = await sendToWebhook('file');
    const response = primary.response;
    let text = primary.text;

    if (!response.ok) {
      const fallback = await sendToWebhook('data');
      if (fallback.response.ok) {
        return new NextResponse(fallback.text, {
          status: 200,
          headers: { 'Content-Type': fallback.response.headers.get('content-type') || 'application/json' },
        });
      }
      text = fallback.text || text;
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: text || 'Webhook request failed.',
          status: response.status,
          statusText: response.statusText || 'Error',
        },
        { status: response.status }
      );
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

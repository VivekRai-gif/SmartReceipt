import {NextResponse} from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {messages} = body;

        if (!messages) {
            return new NextResponse('Messages are required', {status: 400});
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
        });

        return NextResponse.json(completion.choices[0].message);
    } catch (error) {
        console.log('[CHAT_ERROR]', error);
        return new NextResponse('Internal error', {status: 500});
    }
}

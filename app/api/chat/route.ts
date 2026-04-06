import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: "REMOVED",
});

export async function POST(req: Request) {
  try {
    const { message, transactions, stats } = await req.json();

    const systemPrompt = `You are the SmartReceipt AI Assistant, a senior financial analyst. 
    You have access to the user's live receipt data. 
    
    Current Stats:
    - Total Spend: ₹${stats.totalAmount}
    - Receipt Count: ${stats.receiptCount}
    - Flagged Count: ${stats.flaggedCount}
    
    Context Data (Last 20 Transactions):
    ${JSON.stringify(transactions.slice(0, 20), null, 2)}

    Your Goal:
    1. Answer questions about spending trends, categories, and specific merchants.
    2. If the user asks for a chart (like "show pie chart", "bar graph", "spending trend"), 
       respond with a clear textual analysis AND a special command at the end of your message: 
       [COMMAND:SHOW_CHART:type] where type is 'pie', 'bar', 'line', or 'area'.
    3. Keep responses professional, helpful, and concise. Use Indian Rupee (₹) formatting.
    4. If there are fraud flags, mention them as a priority.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ 
      content: response.choices[0].message.content 
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 });
  }
}

import {NextResponse} from 'next/server';

type IncomingMessage = {
    role: 'system' | 'user' | 'assistant' | 'ai';
    content: string;
};

type Transaction = {
    id: string;
    merchant: string;
    amount: number;
    date: string;
    category: string;
    status: 'Complete' | 'Pending' | 'Flagged';
    flagged: boolean;
    flagReason?: string;
    location?: string;
};

const buildFallbackResponse = (question: string, transactions: Transaction[]) => {
    const normalized = question.toLowerCase();

    if (!transactions || transactions.length === 0) {
        return 'You do not have any receipts yet. Upload a receipt to get started.';
    }

    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const flagged = transactions.filter((tx) => tx.flagged);
    const byCategory = transactions.reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

    const parseDate = (value: string) => {
        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? null : new Date(parsed);
    };

    if (normalized.includes('category') || normalized.includes('top spending')) {
        if (!topCategory) {
            return 'No category data found yet.';
        }
        return `Top spending category is ${topCategory[0]} with ₹${topCategory[1].toLocaleString()}.`;
    }

    if (normalized.includes('alert') || normalized.includes('flag')) {
        return flagged.length > 0
            ? `You have ${flagged.length} flagged receipts. Review them in Fraud Detection.`
            : 'No active alerts. All receipts look normal.';
    }

    if (normalized.includes('week')) {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        const recent = transactions.filter((tx) => {
            const date = parseDate(tx.date);
            return date ? date >= weekAgo && date <= now : false;
        });
        const recentTotal = recent.reduce((sum, tx) => sum + tx.amount, 0);
        return `Last 7 days: ${recent.length} receipts totaling ₹${recentTotal.toLocaleString()}.`;
    }

    if (normalized.includes('trend')) {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(now.getDate() - 14);

        const lastWeek = transactions.filter((tx) => {
            const date = parseDate(tx.date);
            return date ? date >= weekAgo && date <= now : false;
        });
        const prevWeek = transactions.filter((tx) => {
            const date = parseDate(tx.date);
            return date ? date >= twoWeeksAgo && date < weekAgo : false;
        });

        const lastTotal = lastWeek.reduce((sum, tx) => sum + tx.amount, 0);
        const prevTotal = prevWeek.reduce((sum, tx) => sum + tx.amount, 0);

        if (prevTotal === 0) {
            return `Current 7-day spend is ₹${lastTotal.toLocaleString()}. Not enough data for a trend yet.`;
        }

        const delta = lastTotal - prevTotal;
        const direction = delta >= 0 ? 'up' : 'down';
        return `Spending is ${direction} ₹${Math.abs(delta).toLocaleString()} compared to the previous week.`;
    }

    return `You have ${transactions.length} receipts totaling ₹${totalAmount.toLocaleString()}. Ask about categories, alerts, or weekly trends.`;
};

export async function POST(req: Request) {
    try {
        const requestBody = (await req.json()) as {messages?: IncomingMessage[]; transactions?: Transaction[]};
        const {messages, transactions} = requestBody || {};

        if (!messages) {
            return NextResponse.json({error: 'Messages are required'}, {status: 400});
        }

        const lastUserMessage = Array.isArray(messages)
            ? messages[messages.length - 1]?.content
            : '';

        const reply = buildFallbackResponse(String(lastUserMessage || ''), Array.isArray(transactions) ? transactions : []);

        return NextResponse.json({content: reply});
    } catch (error) {
        console.log('[CHAT_ERROR]', error);
        const message = error instanceof Error ? error.message : 'Internal error';
        return NextResponse.json({error: message}, {status: 500});
    }
}

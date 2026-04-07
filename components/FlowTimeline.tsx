import { ArrowRight, Bot, LayoutDashboard, ScanLine, Sparkles, Table2, UploadCloud, Workflow } from 'lucide-react';

type FlowVariant = 'full' | 'compact';

type FlowTimelineProps = {
  variant?: FlowVariant;
};

type FlowStep = {
  title: string;
  detail: string;
  Icon: typeof UploadCloud;
  accent: string;
};

const FLOW_STEPS: FlowStep[] = [
  {
    title: '1. Upload receipt (frontend)',
    detail: 'User sends an image or PDF. The file is posted to the webhook.',
    Icon: UploadCloud,
    accent: 'rgba(6,182,212,0.18)'
  },
  {
    title: '2. Webhook triggers n8n workflow',
    detail: 'Event starts an automated pipeline for the receipt.',
    Icon: Workflow,
    accent: 'rgba(249,115,22,0.18)'
  },
  {
    title: '3. AI processing pipeline',
    detail: 'OCR + extraction, cleanup, categorization, fraud checks, and dedupe.',
    Icon: ScanLine,
    accent: 'rgba(124,58,237,0.16)'
  },
  {
    title: '4. Store in Google Sheets',
    detail: 'Routed into category tabs (Food, Bills, Others).',
    Icon: Table2,
    accent: 'rgba(16,185,129,0.18)'
  },
  {
    title: '5. Dashboard analytics',
    detail: 'UI pulls sheets data to show totals, trends, and breakdowns.',
    Icon: LayoutDashboard,
    accent: 'rgba(37,99,235,0.16)'
  },
  {
    title: '6. RAG-based AI assistant',
    detail: 'Queries fetch relevant data and the LLM returns insights.',
    Icon: Bot,
    accent: 'rgba(250,204,21,0.22)'
  }
];


export default function FlowTimeline({ variant = 'full' }: FlowTimelineProps) {
  const isCompact = variant === 'compact';

  return (
    <div className={`flow-card${isCompact ? ' compact' : ''}`}>
      <div className="flow-header">
        <div className="flow-title">
          <Sparkles size={16} />
          <span>SmartReceipt flow overview</span>
        </div>
        <div className="flow-subtitle">User to upload to AI extraction, Google Sheets storage, and RAG insights.</div>
      </div>

      <div className="flow-summary">
        <span>Upload</span>
        <ArrowRight size={12} />
        <span>Webhook</span>
        <ArrowRight size={12} />
        <span>AI pipeline</span>
        <ArrowRight size={12} />
        <span>Sheets</span>
        <ArrowRight size={12} />
        <span>Dashboard</span>
        <ArrowRight size={12} />
        <span>RAG</span>
      </div>

      <div className="flow-steps">
        {FLOW_STEPS.map((step) => (
          <div key={step.title} className="flow-step">
            <div className="flow-icon" style={{ background: step.accent }}>
              <step.Icon size={16} />
            </div>
            <div>
              <div className="flow-step-title">{step.title}</div>
              <div className="flow-step-detail">{step.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flow-link">
        Google Sheets data source:{' '}
        <a
          href="https://docs.google.com/spreadsheets/d/1gHi_jb7mjgUUuu4OYYzeaBSe6rMsoQanAtlD0WAGQPg/edit?usp=sharing"
          target="_blank"
          rel="noreferrer"
        >
          View sheet
        </a>
      </div>

    </div>
  );
}

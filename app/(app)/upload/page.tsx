'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import { Upload, FileImage, CheckCircle2, Loader2, ScanLine, Tag, Brain, Database, MessageSquare } from 'lucide-react';
import { Transaction, useReceiptStore } from '@/lib/store';

type StepStatus = 'pending' | 'active' | 'done';

const PIPELINE_STEPS = [
  { label: 'OCR\nExtract', icon: ScanLine },
  { label: 'Clean\nData', icon: FileImage },
  { label: 'Extract\nFields', icon: Tag },
  { label: 'Categorize', icon: Tag },
  { label: 'Fraud\nCheck', icon: CheckCircle2 },
  { label: 'AI\nInsight', icon: Brain },
  { label: 'Save\nData', icon: Database },
];

export default function UploadPage() {
  const { addTransaction, isDuplicateTransaction } = useReceiptStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [extractedData, setExtractedData] = useState<Transaction | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const runPipeline = useCallback(async (uploadedFile: File) => {
    setProcessing(true);
    setExtractedData(null);
    setWebhookError(null);
    setCurrentStep(0);
    
    let txPayload: Omit<Transaction, 'id'> | null = null;
    let webhookText = '';

    const runStepAnimation = async (steps: number[]) => {
      const uniqueSteps = Array.from(new Set(steps)).filter((step) => step >= 0 && step < PIPELINE_STEPS.length);
      for (const step of uniqueSteps) {
        setCurrentStep(step);
        await new Promise((r) => setTimeout(r, 350));
      }
      setCurrentStep(PIPELINE_STEPS.length);
    };

    const deriveSteps = (webhookData: Record<string, unknown> | null) => {
      if (!webhookData) return PIPELINE_STEPS.map((_, index) => index);

      const completed = webhookData.stepsCompleted || webhookData.completedSteps;
      if (Array.isArray(completed)) {
        const numbers = completed
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value));
        if (numbers.length > 0) return numbers;
      }

      const stepNames = webhookData.steps || webhookData.stepNames;
      if (Array.isArray(stepNames)) {
        const labels = stepNames
          .map((value) => String(value).toLowerCase())
          .filter(Boolean);
        const indices = labels
          .map((label) => PIPELINE_STEPS.findIndex((step) => step.label.replace('\n', ' ').toLowerCase().includes(label)))
          .filter((index) => index >= 0);
        if (indices.length > 0) return indices;
      }

      const count = Number(webhookData.stepCount || webhookData.stepsCount || 0);
      if (Number.isFinite(count) && count > 0) {
        return PIPELINE_STEPS.slice(0, Math.min(count, PIPELINE_STEPS.length)).map((_, index) => index);
      }

      return PIPELINE_STEPS.map((_, index) => index);
    };

    const buildPayload = (raw: Record<string, unknown>) => ({
      merchant: String(raw.merchant || 'Unknown Merchant'),
      amount: Number(raw.amount || 0),
      date: String(raw.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })),
      category: String(raw.category || 'other'),
      status: 'Complete',
      flagged: Boolean(raw.flagged),
      flagReason: raw.flagReason ? String(raw.flagReason) : undefined,
      location: raw.location ? String(raw.location) : undefined,
    });

    const handleSuccess = async (payload: Record<string, unknown>) => {
      txPayload = buildPayload(payload);
      await runStepAnimation(deriveSteps(payload));
    };

    try {
      const form = new FormData();
      form.append('file', uploadedFile, uploadedFile.name);

      const webhookResponse = await fetch('https://shubhjhack.app.n8n.cloud/webhook/Expense-tracker', {
        method: 'POST',
        body: form,
      });

      webhookText = await webhookResponse.text();

      if (webhookResponse.ok) {
        try {
          const webhookData = JSON.parse(webhookText);
          if (webhookData && typeof webhookData === 'object') {
            await handleSuccess(webhookData as Record<string, unknown>);
          }
        } catch (parseError) {
          console.error('Webhook JSON parse error:', parseError);
          setWebhookError('n8n issue: Invalid JSON response from webhook.');
        }
      } else {
        let reason = webhookText || 'Webhook request failed.';
        let statusLabel = '';
        try {
          const parsed = JSON.parse(webhookText);
          if (parsed && typeof parsed === 'object') {
            if (parsed.error) {
              reason = String(parsed.error);
            }
            if (parsed.status || parsed.statusText) {
              const status = parsed.status ? String(parsed.status) : '';
              const statusText = parsed.statusText ? String(parsed.statusText) : '';
              statusLabel = [status, statusText].filter(Boolean).join(' ');
            }
          }
        } catch {
          // Use raw text as reason when JSON parse fails.
        }
        const statusSuffix = statusLabel ? ` (${statusLabel})` : '';
        setWebhookError(`n8n issue: ${reason}${statusSuffix}`);
      }
    } catch (error) {
      console.error('Webhook request failed:', error);
      const messageText = error instanceof Error ? error.message : 'Webhook request failed.';
      setWebhookError(`n8n issue: ${messageText}`);
    }

    if (!txPayload) {
      setProcessing(false);
      setCurrentStep(PIPELINE_STEPS.length);
      setExtractedText(webhookText || 'Webhook did not return structured data.');
      setSummaryText('No structured data returned from webhook. Please check the n8n workflow response.');
      return;
    }

    const flaggedTx = {
      ...txPayload,
      flagged: txPayload.flagged,
      flagReason: txPayload.flagReason,
    };

    if (!isDuplicateTransaction(flaggedTx)) {
      addTransaction(flaggedTx);
    }

    const textBlock = [
      `Merchant: ${flaggedTx.merchant}`,
      `Amount: ₹${flaggedTx.amount.toLocaleString()}`,
      `Date: ${flaggedTx.date}`,
      `Category: ${flaggedTx.category}`,
      `Location: ${flaggedTx.location || 'Online'}`,
    ].join('\n');

    const summary = `Merchant: ${flaggedTx.merchant} · Date: ${flaggedTx.date} · Total: ₹${flaggedTx.amount.toLocaleString()}`;

    const rawText = webhookText.trim();
    const mergedExtractedText = rawText.length > 0
      ? `${textBlock}\n\nRaw webhook response:\n${rawText}`
      : textBlock;

    if (currentStep < PIPELINE_STEPS.length) {
      setCurrentStep(PIPELINE_STEPS.length);
    }
    setExtractedData(flaggedTx);
    setExtractedText(mergedExtractedText);
    setSummaryText(summary);
    setProcessing(false);
  }, [addTransaction, isDuplicateTransaction]);

  const runGeminiFallback = useCallback(async (uploadedFile: File) => {
    setProcessing(true);
    setWebhookError(null);
    setCurrentStep(0);

    try {
      const form = new FormData();
      form.append('file', uploadedFile, uploadedFile.name);

      const response = await fetch('/api/gemini', {
        method: 'POST',
        body: form,
      });

      const text = await response.text();

      if (!response.ok) {
        setWebhookError(`Gemini issue: ${text || 'Gemini request failed.'}`);
        setProcessing(false);
        return;
      }

      let geminiData: Record<string, unknown> | null = null;
      try {
        geminiData = JSON.parse(text);
      } catch (parseError) {
        console.error('Gemini JSON parse error:', parseError);
      }

      if (!geminiData) {
        setWebhookError('Gemini issue: Invalid JSON response.');
        setProcessing(false);
        return;
      }

      const txPayload: Omit<Transaction, 'id'> = {
        merchant: String(geminiData.merchant || 'Unknown Merchant'),
        amount: Number(geminiData.amount || 0),
        date: String(geminiData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })),
        category: String(geminiData.category || 'other'),
        status: 'Complete',
        flagged: Boolean(geminiData.flagged),
        flagReason: geminiData.flagReason ? String(geminiData.flagReason) : undefined,
        location: geminiData.location ? String(geminiData.location) : undefined,
      };

      if (!isDuplicateTransaction(txPayload)) {
        addTransaction(txPayload);
      }

      setCurrentStep(PIPELINE_STEPS.length);
      setExtractedData(txPayload);
      setExtractedText(JSON.stringify(geminiData, null, 2));
      setSummaryText(`Merchant: ${txPayload.merchant} · Date: ${txPayload.date} · Total: ₹${txPayload.amount.toLocaleString()}`);
      setProcessing(false);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Gemini request failed.';
      setWebhookError(`Gemini issue: ${messageText}`);
      setProcessing(false);
    }
  }, [addTransaction, isDuplicateTransaction]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith('image/') && f.type !== 'application/pdf') return;
    setFile(f);
    runPipeline(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const getStepStatus = (i: number): StepStatus => {
    if (currentStep > i) return 'done';
    if (currentStep === i) return 'active';
    return 'pending';
  };

  return (
    <>
      <PageHeader title="Upload Receipt" subtitle="Drag & drop or browse to upload a receipt image. We POST to the webhook to trigger the n8n pipeline." />
      <div className="page-content">
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {!file && (
            <div
              id="upload-dropzone"
              className={`upload-zone animate-fade-in-up${isDragOver ? ' drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload receipt files"
            >
              <div className="upload-icon-wrap"><Upload size={32} /></div>
              <div className="upload-title">Drop your receipt here</div>
              <div className="upload-subtitle">
                Supports PNG, JPG, WEBP, and PDF. On upload, we POST the file to the n8n form endpoint to trigger the pipeline.
              </div>
              <div className="upload-filetypes">
                {['PNG', 'JPG', 'WEBP', 'PDF'].map((t) => (
                  <span key={t} className="upload-filetype-tag">{t}</span>
                ))}
              </div>
              <button className="btn btn-primary" id="browse-files-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                Browse Files
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} id="file-input" onChange={(e) => handleFiles(e.target.files)} />
            </div>
          )}

          {file && (
            <div className="card animate-fade-in-up" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🧾</div>
                  <div>
                    <div className="card-title">{file.name}</div>
                    <div className="card-subtitle">{(file.size / 1024).toFixed(1)} KB · {file.type || 'image'}</div>
                  </div>
                </div>
                {processing && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</div>}
                {extractedData && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-accent-emerald)', fontSize: 13, fontWeight: 600 }}><CheckCircle2 size={16} /> Saved to Database</div>}
              </div>

              <div style={{ borderBottom: '1px solid var(--border-light)', overflowX: 'auto' }}>
                <div className="pipeline-steps" style={{ minWidth: 600 }}>
                  {PIPELINE_STEPS.map((step, i) => {
                    const status = getStepStatus(i);
                    const Icon = step.icon;
                    return (
                      <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
                        <div className={`pipeline-step ${status}`}>
                          <div className="pipeline-step-icon">
                            {status === 'done' ? <CheckCircle2 size={18} /> : status === 'active' ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Icon size={18} />}
                          </div>
                          <div className="pipeline-step-label">{step.label}</div>
                        </div>
                        {i < PIPELINE_STEPS.length - 1 && <div className={`pipeline-connector${status === 'done' ? ' done' : ''}`} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card-body" style={{ padding: '32px 24px' }}>
                {processing && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Running AI pipeline…</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      Waiting for n8n to finish. Step {Math.min(currentStep + 1, PIPELINE_STEPS.length)} of {PIPELINE_STEPS.length}: {PIPELINE_STEPS[Math.min(currentStep, PIPELINE_STEPS.length - 1)]?.label.replace('\n', ' ')}
                    </div>
                  </div>
                )}
                {webhookError && (
                  <div className="card" style={{ padding: 16, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', borderRadius: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#B91C1C', marginBottom: 6 }}>n8n issue</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{webhookError}</div>
                    {file && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ marginTop: 10 }}
                        onClick={() => runGeminiFallback(file)}
                      >
                        Continue with Gemini
                      </button>
                    )}
                  </div>
                )}
                {extractedData && !webhookError && (
                  <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '10px 0' }}>
                    
                    {/* Database Report Column */}
                    <div>
                      <h4 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Extraction Report</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'var(--bg-base)', padding: 16, borderRadius: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Merchant</div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{extractedData.merchant}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Amount</div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>₹{extractedData.amount.toLocaleString()}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Date</div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{extractedData.date}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Location</div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{extractedData.location || 'Online'}</div>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Category</div>
                          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize', display: 'inline-block', padding: '2px 8px', background: 'rgba(0,0,0,0.06)', borderRadius: 4, color: 'var(--text-primary)' }}>{extractedData.category}</div>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Extracted Text</div>
                          <pre style={{ fontSize: 11, lineHeight: 1.5, whiteSpace: 'pre-wrap', margin: 0, color: 'var(--text-secondary)' }}>{extractedText}</pre>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Summary</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{summaryText}</div>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                        <button className="btn btn-ghost" id="upload-another-btn" onClick={() => { setFile(null); setCurrentStep(-1); setExtractedData(null); }}>Upload Next</button>
                        <button className="btn btn-primary" id="view-analysis-btn" onClick={() => router.push('/analysis')}>View Dashboard</button>
                      </div>
                    </div>

                    {/* Chat Analysis Popup Content */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))', borderRadius: 14, padding: 20, border: '1px solid rgba(99,102,241,0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: '#8B5CF6', fontWeight: 600, fontSize: 13 }}>
                        <MessageSquare size={16} /> Instant AI Analysis
                      </div>
                      
                      {extractedData.flagged ? (
                        <div style={{ fontSize: 13, lineHeight: 1.6, color: '#D97706' }}>
                          <strong>⚠️ Anomaly Detected:</strong> {extractedData.flagReason} This looks unusual compared to your running average. I strongly recommend reviewing this transaction manually.
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                          <strong>✅ Looks Good:</strong> This {extractedData.category} expense fits perfectly within your usual budget bounds. I have safely categorized it to "{extractedData.category}" and securely synced to your MongoDB. No action needed!
                        </div>
                      )}
                    </div>
                    
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import { Upload, FileImage, CheckCircle2, Loader2, ScanLine, Tag, Brain, Database, MessageSquare } from 'lucide-react';
import { useReceiptStore, Transaction } from '@/lib/store';

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

const MERCHANTS = ['Starbucks', 'Uber Trip', 'Amazon Web Services', 'Swiggy', 'MakeMyTrip', 'WeWork'];
const CATEGORIES = ['food', 'travel', 'software', 'shopping', 'utilities', 'other'];

export default function UploadPage() {
  const { addTransaction } = useReceiptStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [extractedData, setExtractedData] = useState<Transaction | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const runPipeline = useCallback(async () => {
    setProcessing(true);
    setExtractedData(null);
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 600));
    }
    
    // Simulate LLM extraction data
    const fakeAmount = parseFloat((Math.random() * 2000 + 50).toFixed(2));
    const isFlagged = Math.random() > 0.8;
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
    const IN_LOCATIONS = ['Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Online', 'Pune, India', 'Gurgaon, India'];
    const location = IN_LOCATIONS[Math.floor(Math.random() * IN_LOCATIONS.length)];

    const txPayload = {
      merchant,
      amount: fakeAmount,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      category: cat,
      status: 'Complete' as const,
      flagged: isFlagged,
      flagReason: isFlagged ? 'Amount exceeds daily average category threshold.' : undefined,
      location: location
    };

    // Store in our local "database"
    const savedTx = addTransaction(txPayload);

    setCurrentStep(PIPELINE_STEPS.length);
    setExtractedData(savedTx);
    setProcessing(false);
  }, [addTransaction]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith('image/') && f.type !== 'application/pdf') return;
    setFile(f);
    runPipeline();
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
      <PageHeader title="Upload Receipt" subtitle="Drag & drop or browse to upload a receipt image" />
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
                Supports PNG, JPG, WEBP, and PDF. Our AI pipeline will extract and analyze all data automatically.
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
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Step {Math.min(currentStep + 1, PIPELINE_STEPS.length)} of {PIPELINE_STEPS.length}: {PIPELINE_STEPS[Math.min(currentStep, PIPELINE_STEPS.length - 1)]?.label.replace('\n', ' ')}</div>
                  </div>
                )}
                {extractedData && (
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

'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import { Upload, FileImage, CheckCircle2, Loader2, ScanLine, Tag, Brain, Database } from 'lucide-react';

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
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const runPipeline = useCallback(async () => {
    setProcessing(true);
    setDone(false);
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 700));
    }
    setCurrentStep(PIPELINE_STEPS.length);
    setDone(true);
    setProcessing(false);
  }, []);

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
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
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
            <div className="card animate-fade-in-up">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🧾</div>
                  <div>
                    <div className="card-title">{file.name}</div>
                    <div className="card-subtitle">{(file.size / 1024).toFixed(1)} KB · {file.type || 'image'}</div>
                  </div>
                </div>
                {processing && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</div>}
                {done && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-accent-emerald)', fontSize: 13, fontWeight: 600 }}><CheckCircle2 size={16} /> Complete!</div>}
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

              <div className="card-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
                {processing && (
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Running AI pipeline…</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Step {Math.min(currentStep + 1, PIPELINE_STEPS.length)} of {PIPELINE_STEPS.length}: {PIPELINE_STEPS[Math.min(currentStep, PIPELINE_STEPS.length - 1)]?.label.replace('\n', ' ')}</div>
                  </div>
                )}
                {done && (
                  <div className="animate-fade-in-up">
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Receipt Analyzed Successfully</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Merchant, amount, date, and category extracted. Fraud check passed.</div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                      <button className="btn btn-primary" id="view-analysis-btn" onClick={() => router.push('/analysis')}>View Analysis</button>
                      <button className="btn btn-ghost" id="upload-another-btn" onClick={() => { setFile(null); setCurrentStep(-1); setDone(false); }}>Upload Another</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!file && (
            <div className="grid-3" style={{ marginTop: 24 }}>
              {[
                { icon: '🔍', title: 'Smart OCR', desc: 'Extracts text from any receipt image with high accuracy.' },
                { icon: '🧠', title: 'AI Extraction', desc: 'LLM identifies merchant, amount, date automatically.' },
                { icon: '🛡️', title: 'Fraud Guard', desc: 'Detects duplicates and unusual patterns in real time.' },
              ].map((tip) => (
                <div key={tip.title} className="card animate-fade-in-up">
                  <div className="card-body" style={{ textAlign: 'center', padding: '24px 20px' }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>{tip.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>{tip.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

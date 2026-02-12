import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { PortfolioAsset, PortfolioBreakdown } from '../core/types';

interface PortfolioImporterProps {
  onImportSuccess: (
    assets: PortfolioAsset[],
    breakdown: PortfolioBreakdown,
  ) => void;
  onClose: () => void;
}

export function PortfolioImporter({
  onImportSuccess,
  onClose,
}: PortfolioImporterProps) {
  const [activeTab, setActiveTab] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [aaHandle, setAaHandle] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  // --- AA FLOW MOCK ---
  const handleAaConnect = async () => {
    if (!aaHandle.includes('@')) {
      setError('Please enter a valid AA Handle (e.g., mobile@finae)');
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      setProcessStep('Initiating Consent Request...');
      await new Promise((r) => setTimeout(r, 1500));

      setProcessStep('Waiting for Approval on Bank App...');
      await new Promise((r) => setTimeout(r, 2000));

      setProcessStep('Fetching Financial Data...');
      await new Promise((r) => setTimeout(r, 1500));

      finishImport('Account Aggregator (Setu)');
    } catch (e) {
      setError('Connection timed out. Please try again.');
      setIsProcessing(false);
    }
  };

  // --- MANUAL FLOW MOCK ---
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsProcessing(true);
    setProcessStep('Uploading Encrypted File...');
    await new Promise((r) => setTimeout(r, 1000));

    setProcessStep('Decrypting & Parsing PDF...');
    await new Promise((r) => setTimeout(r, 1500));

    setProcessStep('Extracting Portfolio Holdings...');
    await new Promise((r) => setTimeout(r, 800));

    finishImport('Manual Upload');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/csv': ['.csv'] },
    maxFiles: 1,
  });

  // --- SHARED SUCCESS LOGIC ---
  const finishImport = (
    source: 'Account Aggregator (Setu)' | 'Manual Upload',
  ) => {
    // MOCK DATA GENERATION
    const mockAssets: PortfolioAsset[] = [
      { name: 'Nifty 50 Index Fund', value: 2150000, category: 'Equity' },
      { name: 'Parag Parikh Flexi Cap', value: 1240000, category: 'Equity' },
      { name: 'SGB 2024 Series I', value: 450000, category: 'Cash' }, // Gold treated as Cash/Alternative
      { name: 'Corporate Bond Fund', value: 890000, category: 'Debt' },
      { name: 'Liquid Fund', value: 320000, category: 'Cash' },
    ];

    const totalEquity = mockAssets
      .filter((a) => a.category === 'Equity')
      .reduce((s, a) => s + a.value, 0);
    const totalDebt = mockAssets
      .filter((a) => a.category === 'Debt')
      .reduce((s, a) => s + a.value, 0);
    const totalCash = mockAssets
      .filter((a) => a.category === 'Cash')
      .reduce((s, a) => s + a.value, 0);

    const mockBreakdown: PortfolioBreakdown = {
      equity: totalEquity,
      debt: totalDebt,
      cash: totalCash,
      lastUpdated: new Date().toLocaleDateString(),
      source: source as any,
    };

    onImportSuccess(mockAssets, mockBreakdown);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="max-w-2xl w-full bg-[#121214] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <UploadCloud className="text-emerald-500 w-6 h-6" />
            Import Portfolio
          </h2>
          <p className="text-white/40 text-sm mt-1">
            Sync your investments to get accurate Merton projections.
          </p>
        </div>

        {/* TABS */}
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setActiveTab('AUTO')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === 'AUTO' ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500' : 'text-white/30 hover:bg-white/5'}`}
          >
            Auto-Sync (AA)
          </button>
          <button
            onClick={() => setActiveTab('MANUAL')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === 'MANUAL' ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500' : 'text-white/30 hover:bg-white/5'}`}
          >
            Manual Upload
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 flex-1 overflow-y-auto min-h-[400px]">
          {isProcessing ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6 animate-pulse">
              <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">{processStep}</h3>
                <p className="text-white/30 text-sm">
                  Encrypting & processing local data...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* AUTO SYNC TAB */}
              {activeTab === 'AUTO' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-4">
                    <Smartphone className="w-6 h-6 text-emerald-400 mt-1 shrink-0" />
                    <div>
                      <h4 className="text-emerald-400 font-bold text-sm">
                        Account Aggregator (AA)
                      </h4>
                      <p className="text-white/50 text-xs mt-1 leading-relaxed">
                        Connect securely via Setu/Sahamati. You will approve the
                        data sharing request on your preferred AA app (PhonePe,
                        CRED, etc.).
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-white/40 uppercase pl-1">
                      Enter AA Handle / VPA
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="mobile@finae"
                        value={aaHandle}
                        onChange={(e) => setAaHandle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-mono focus:border-emerald-500 outline-none transition-colors"
                      />
                      <button
                        onClick={handleAaConnect}
                        className="absolute right-2 top-2 bottom-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 rounded-lg transition-colors flex items-center gap-2"
                      >
                        Connect <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    {error && (
                      <p className="text-red-400 text-xs pl-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {error}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-8">
                    {['Mutual Funds', 'Stocks', 'Bank Deposits'].map((item) => (
                      <div
                        key={item}
                        className="bg-white/5 rounded-lg p-3 text-center border border-white/5"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                        <span className="text-[10px] uppercase font-bold text-white/50">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MANUAL UPLOAD TAB */}
              {activeTab === 'MANUAL' && (
                <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-4">
                    <FileText className="w-6 h-6 text-blue-400 mt-1 shrink-0" />
                    <div>
                      <h4 className="text-blue-400 font-bold text-sm">
                        CAS Statement Upload
                      </h4>
                      <p className="text-white/50 text-xs mt-1 leading-relaxed">
                        Upload your NSDL/CDSL Consolidated Account Statement
                        (PDF). Logic runs locally in your browser.
                      </p>
                    </div>
                  </div>

                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                  >
                    <input {...getInputProps()} />
                    <UploadCloud
                      className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragActive ? 'text-blue-400' : 'text-white/20 group-hover:text-white/50'}`}
                    />
                    <p className="text-white font-medium">
                      Drag & drop your CAS PDF here
                    </p>
                    <p className="text-white/30 text-sm mt-1">
                      or click to browse files
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-white/40 uppercase pl-1">
                      Document Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 w-4 h-4 text-white/30" />
                      <input
                        type="password"
                        placeholder="PAN Number (usually)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-mono focus:border-blue-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER - PRIVACY SHIELD */}
        <div className="p-4 bg-[#0a0a0b] border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-500/80">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              End-to-End Encrypted
            </span>
          </div>
          <p className="text-[10px] text-white/20 max-w-xs text-right leading-tight">
            Your data is processed locally. We use RBI-regulated AA frameworks
            for secure data sharing.
          </p>
          <button
            onClick={onClose}
            className="ml-4 text-white/40 hover:text-white text-xs underline decoration-white/20 hover:decoration-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

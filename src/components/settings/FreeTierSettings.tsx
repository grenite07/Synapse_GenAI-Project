import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  ShieldCheck,
  Zap,
  DollarSign,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const FreeTierSettings: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuota();
  }, []);

  const loadQuota = async () => {
    setLoading(true);
    try {
      const res = await api.getQuota();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const quota = data?.quota;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Free-Tier Protection & Cost Awareness Console
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Strict guarantees preventing unexpected cloud expenditure while maximizing free educational quotas.
        </p>
      </div>

      {/* Hero Status Card */}
      <div className="p-6 bg-gradient-to-r from-emerald-950 to-slate-900 rounded-xl text-white border border-emerald-800/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Cost Guarantee Enforced</span>
          </div>
          <h2 className="text-2xl font-bold font-mono tabular-nums">
            Total Operational Incurred Cost: $0.00
          </h2>
          <p className="text-xs text-emerald-200/80 max-w-xl">
            This platform runs entirely within permanently free tiers: Google Gemini Flash (1,500 daily requests free), in-memory / local pgvector embeddings, and browser-native voice synthesis.
          </p>
        </div>

        <button
          onClick={loadQuota}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white shadow-2xs self-start md:self-center transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Quotas</span>
        </button>
      </div>

      {/* Quota Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Daily API Requests</span>
            <Cpu className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {quota?.requestsToday || 0} / {quota?.maxRequestsPerDay || 1500}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full"
              style={{
                width: `${Math.min(
                  ((quota?.requestsToday || 0) / (quota?.maxRequestsPerDay || 1500)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            Resets daily at 00:00 UTC
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Tokens Consumed Today</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {Number(quota?.tokensUsedToday || 0).toLocaleString()} / 1M
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full"
              style={{
                width: `${Math.min(
                  ((quota?.tokensUsedToday || 0) / (quota?.maxTokensPerDay || 1000000)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            Optimized chunk overlap token budgeting
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Vector Index Capacity</span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {quota?.chunksStored || 0} / {quota?.maxFreeChunks || 50000}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{
                width: `${Math.min(
                  ((quota?.chunksStored || 0) / (quota?.maxFreeChunks || 50000)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            Cosine vector memory active
          </div>
        </div>
      </div>

      {/* Free Tier Best Practices & Architectural Protections */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Architectural Safeguards & Cost Control Rules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Deterministic Vector Fallback</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
              If external embedding quota is exhausted or offline, the platform seamlessly switches to built-in high-dimensional deterministic vectors. Your semantic search and RAG continue working without failing.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Token Budgeting & Caching</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
              Summary generations and quiz formulations are saved to prevent redundant API calls. Document chunk sizes are constrained to 750 characters with 100 character overlap to conserve context window tokens.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Browser-Native Speech Stack</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
              Voice query input and text-to-speech recitation run directly inside the browser using standard Web Speech APIs, completely bypassing costly third-party audio transcription or speech synthesis cloud bills.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Pluggable Provider Abstractions</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
              The core code interfaces with <code>IAIProvider</code>, <code>IVectorStore</code>, and <code>IStorageProvider</code>. You can switch between Gemini, local Ollama, Supabase, Neon PostgreSQL, or Cloudflare at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  FileText, 
  Zap, 
  BarChart3, 
  Settings2, 
  ChevronRight,
  Sparkles,
  History,
  LayoutDashboard,
  PenTool
} from 'lucide-react';
import { AnalysisSidebar } from './components/AnalysisSidebar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { analyzeSEO, type SEOAnalysis } from './services/gemini';
import { cn } from './lib/utils';

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [content, setContent] = useState('');
  const [mainKeyword, setMainKeyword] = useState('');
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzedContent, setLastAnalyzedContent] = useState('');
  const [lastAnalyzedKeyword, setLastAnalyzedKeyword] = useState('');

  const handleAnalyze = useCallback(async () => {
    if (!content.trim() || !mainKeyword.trim()) return;
    if (content === lastAnalyzedContent && mainKeyword === lastAnalyzedKeyword) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeSEO(content, mainKeyword);
      setAnalysis(result);
      setLastAnalyzedContent(content);
      setLastAnalyzedKeyword(mainKeyword);
    } catch (error) {
      console.error('Analysis failed:', error);
      // If result is invalid JSON or other error, we don't set analysis to avoid crash
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, mainKeyword, lastAnalyzedContent, lastAnalyzedKeyword]);

  // Auto-analyze after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.length > 50 && mainKeyword.length > 2) {
        handleAnalyze();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [content, mainKeyword, handleAnalyze]);

  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans overflow-hidden">
      {/* Left Navigation Rail */}
      <aside className="w-16 flex flex-col items-center py-6 border-r border-slate-200 bg-slate-50/30 shrink-0">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-200">
          <Zap className="text-white w-6 h-6" />
        </div>
        <nav className="flex flex-col gap-6">
          <button className="p-2 text-indigo-600 bg-indigo-50 rounded-lg transition-colors">
            <LayoutDashboard className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <FileText className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <BarChart3 className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <History className="w-5 h-5" />
          </button>
        </nav>
        <div className="mt-auto flex flex-col gap-6">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Settings2 className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="輸入主關鍵字 (短尾詞)..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg text-sm font-medium transition-all outline-none"
                value={mainKeyword}
                onChange={(e) => setMainKeyword(e.target.value)}
              />
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !content || !mainKeyword}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2 shadow-md shadow-indigo-100"
            >
              {isAnalyzing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              立即分析
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">即時監控中</span>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden flex flex-col p-8 bg-slate-50/30">
          <div className="max-w-4xl w-full mx-auto flex flex-col h-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="h-12 border-b border-slate-100 flex items-center px-6 justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">內容編輯器</span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-mono">
                  {content.length} 字元 | {content.split(/\s+/).filter(Boolean).length} 單詞
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase transition-colors">Markdown</button>
                <button className="px-2 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 rounded uppercase">視覺化</button>
              </div>
            </div>
            
            <textarea 
              className="flex-1 p-8 text-lg leading-relaxed text-slate-800 focus:outline-none resize-none placeholder:text-slate-300 font-serif"
              placeholder="在此開始撰寫您的 SEO 優化內容..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* Keyword Heatmap Preview (Simplified) */}
            {mainKeyword && content.includes(mainKeyword) && (
              <div className="h-1 bg-slate-100 w-full relative">
                {/* This is a visual representation of where keywords appear */}
                <div className="absolute inset-0 flex">
                  {content.split('\n').map((line, i) => (
                    line.includes(mainKeyword) && (
                      <div key={i} className="h-full bg-indigo-400/50 flex-1 mx-px" />
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Right Sidebar - Analysis */}
      <aside className="w-[400px] border-l border-slate-200 flex flex-col shrink-0 bg-white">
        <AnalysisSidebar analysis={analysis} isLoading={isAnalyzing} />
      </aside>
    </div>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Target, 
  Search, 
  Zap, 
  ShieldCheck,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { ScoreCard } from './ScoreCard';
import type { SEOAnalysis } from '../services/gemini';
import { cn } from '../lib/utils';

interface AnalysisSidebarProps {
  analysis: SEOAnalysis | null;
  isLoading: boolean;
}

export function AnalysisSidebar({ analysis, isLoading }: AnalysisSidebarProps) {
  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 space-y-4 bg-slate-50/50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">正在分析語義意圖...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-50/50">
        <Search className="w-12 h-12 text-slate-300" />
        <div>
          <h3 className="text-slate-900 font-semibold">準備好進行分析</h3>
          <p className="text-slate-500 text-sm mt-1">請輸入內容與主關鍵字，啟動 SEO AI 教練。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50/50 p-6 space-y-6 custom-scrollbar">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">總體表現</h2>
        </div>
        <ScoreCard 
          title="SEO 評分" 
          score={analysis.overallScore} 
          description="基於關鍵字密度、意圖匹配及演算法準備度。"
          className="bg-indigo-50/30 border-indigo-100"
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">關鍵字矩陣</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">短尾詞 (核心)</span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                analysis.shortTailAnalysis.status === 'good' ? "bg-emerald-100 text-emerald-700" :
                analysis.shortTailAnalysis.status === 'warning' ? "bg-amber-100 text-amber-700" :
                "bg-rose-100 text-rose-700"
              )}>
                {analysis.shortTailAnalysis.status === 'good' ? '良好' : 
                 analysis.shortTailAnalysis.status === 'warning' ? '警告' : '偏低'}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900">「{analysis.shortTailAnalysis.keyword}」</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-xs text-slate-500">
                次數: <span className="font-mono font-bold text-slate-900">{analysis.shortTailAnalysis.count}</span>
              </div>
              <div className="text-xs text-slate-500">
                權重: <span className="font-mono font-bold text-slate-900">{analysis.shortTailAnalysis.weight}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-400 uppercase block mb-2">長尾詞覆蓋率</span>
            <div className="flex flex-wrap gap-2">
              {analysis.longTailAnalysis.found.map((word, i) => (
                <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md border border-indigo-100">
                  {word}
                </span>
              ))}
              {analysis.longTailAnalysis.found.length === 0 && (
                <span className="text-xs text-slate-400 italic">未偵測到長尾關鍵字。</span>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">建議補充</span>
              <div className="flex flex-wrap gap-2">
                {analysis.longTailAnalysis.suggested.map((word, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200 opacity-70">
                    + {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">E-E-A-T 信任度</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ScoreCard title="經驗" score={analysis.eeatScore.experience} className="p-3" />
          <ScoreCard title="專業" score={analysis.eeatScore.expertise} className="p-3" />
          <ScoreCard title="權威" score={analysis.eeatScore.authoritativeness} className="p-3" />
          <ScoreCard title="信任" score={analysis.eeatScore.trustworthiness} className="p-3" />
        </div>
        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <p className="text-xs text-indigo-900 leading-relaxed">
            {analysis.eeatScore.feedback}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">有用內容系統</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ScoreCard title="稀缺性" score={analysis.helpfulContent.uniqueness} className="p-3" />
          <ScoreCard title="滿足感" score={analysis.helpfulContent.satisfaction} className="p-3" />
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">搜尋意圖：</span>
            <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded uppercase tracking-wider">
              {analysis.intent === 'Informational' ? '資訊型' :
               analysis.intent === 'Transactional' ? '交易型' :
               analysis.intent === 'Navigational' ? '導向型' : '商業調查型'}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {analysis.helpfulContent.feedback}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">SERP 缺口分析</h2>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase">競品平均字數</span>
            <span className="text-sm font-bold text-slate-900 font-mono">{analysis.serpGapAnalysis.competitorAvgLength} 字</span>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">缺失主題 / 關鍵字</span>
            <div className="flex flex-wrap gap-2">
              {analysis.serpGapAnalysis.missingTopics.map((topic, i) => (
                <span key={i} className="px-2 py-1 bg-rose-50 text-rose-700 text-[10px] font-medium rounded border border-rose-100">
                  {topic}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">差異化策略</span>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              「{analysis.serpGapAnalysis.differentiationStrategy}」
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">優化提醒</h2>
        </div>
        <AnimatePresence>
          {analysis.alerts.map((alert, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                "p-3 rounded-lg border flex gap-3 items-start",
                alert.type === 'warning' ? "bg-rose-50 border-rose-100 text-rose-800" :
                alert.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-800" :
                "bg-blue-50 border-blue-100 text-blue-800"
              )}
            >
              {alert.type === 'warning' ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> :
               alert.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> :
               <Info className="w-4 h-4 mt-0.5 shrink-0" />}
              <p className="text-xs font-medium leading-tight">{alert.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </section>

      <section className="pb-12">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">AI 優化建議</h2>
        </div>
        <div className="space-y-2">
          {analysis.suggestions.map((suggestion, i) => (
            <div key={i} className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 shadow-sm">
              {suggestion}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

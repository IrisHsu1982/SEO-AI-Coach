import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface SEOAnalysis {
  overallScore: number;
  shortTailAnalysis: {
    keyword: string;
    count: number;
    weight: number;
    status: 'good' | 'warning' | 'low';
  };
  longTailAnalysis: {
    found: string[];
    suggested: string[];
    intentCoverage: number;
  };
  eeatScore: {
    experience: number;
    expertise: number;
    authoritativeness: number;
    trustworthiness: number;
    feedback: string;
  };
  helpfulContent: {
    uniqueness: number;
    satisfaction: number;
    feedback: string;
  };
  serpGapAnalysis: {
    competitorAvgLength: number;
    missingTopics: string[];
    differentiationStrategy: string;
  };
  intent: 'Informational' | 'Transactional' | 'Navigational' | 'Commercial';
  alerts: {
    type: 'warning' | 'info' | 'success';
    message: string;
  }[];
  suggestions: string[];
}

export async function analyzeSEO(content: string, mainKeyword: string): Promise<SEOAnalysis> {
  const prompt = `
    請根據主關鍵字「${mainKeyword}」分析以下內容的 SEO 表現。
    請考慮 Google 的最新演算法（E-E-A-T、Helpful Content、BERT/MUM）。
    
    內容：
    ${content}
    
    請以 JSON 格式提供詳細分析。請包含 SERP 缺口分析，將此內容與假設的排名領先競爭對手進行比較。
    所有回饋、建議和訊息請使用「繁體中文」。
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          shortTailAnalysis: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              count: { type: Type.NUMBER },
              weight: { type: Type.NUMBER },
              status: { type: Type.STRING, enum: ['good', 'warning', 'low'] }
            },
            required: ['keyword', 'count', 'weight', 'status']
          },
          longTailAnalysis: {
            type: Type.OBJECT,
            properties: {
              found: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggested: { type: Type.ARRAY, items: { type: Type.STRING } },
              intentCoverage: { type: Type.NUMBER }
            },
            required: ['found', 'suggested', 'intentCoverage']
          },
          eeatScore: {
            type: Type.OBJECT,
            properties: {
              experience: { type: Type.NUMBER },
              expertise: { type: Type.NUMBER },
              authoritativeness: { type: Type.NUMBER },
              trustworthiness: { type: Type.NUMBER },
              feedback: { type: Type.STRING }
            },
            required: ['experience', 'expertise', 'authoritativeness', 'trustworthiness', 'feedback']
          },
          helpfulContent: {
            type: Type.OBJECT,
            properties: {
              uniqueness: { type: Type.NUMBER },
              satisfaction: { type: Type.NUMBER },
              feedback: { type: Type.STRING }
            },
            required: ['uniqueness', 'satisfaction', 'feedback']
          },
          serpGapAnalysis: {
            type: Type.OBJECT,
            properties: {
              competitorAvgLength: { type: Type.NUMBER },
              missingTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
              differentiationStrategy: { type: Type.STRING }
            },
            required: ['competitorAvgLength', 'missingTopics', 'differentiationStrategy']
          },
          intent: { type: Type.STRING, enum: ['Informational', 'Transactional', 'Navigational', 'Commercial'] },
          alerts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['warning', 'info', 'success'] },
                message: { type: Type.STRING }
              },
              required: ['type', 'message']
            }
          },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: [
          'overallScore', 
          'shortTailAnalysis', 
          'longTailAnalysis', 
          'eeatScore', 
          'helpfulContent', 
          'serpGapAnalysis',
          'intent', 
          'alerts', 
          'suggestions'
        ]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function optimizeParagraph(paragraph: string, targetKeyword: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `請針對關鍵字「${targetKeyword}」優化以下段落，使其更符合 SEO、提升可讀性與有用性。保持原意不變。請使用「繁體中文」回覆。\n\n段落：${paragraph}`,
  });
  return response.text || paragraph;
}

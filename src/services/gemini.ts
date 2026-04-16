
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
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, mainKeyword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '分析失敗');
  }

  return response.json();
}

export async function optimizeParagraph(paragraph: string, targetKeyword: string): Promise<string> {
  // For now, we'll just focus on the main analysis. 
  // If needed, we can add a dedicated endpoint for optimization.
  return paragraph;
}

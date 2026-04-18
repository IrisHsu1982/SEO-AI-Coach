import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: "nodejs",
};

function extractJson(raw: string) {
  const trimmed = (raw || "").trim();

  if (!trimmed) {
    throw new Error("Gemini 沒有回傳內容");
  }

  try {
    return JSON.parse(trimmed);
  } catch {}

  const fenced =
    trimmed.match(/```json\s*([\s\S]*?)\s*```/i) ||
    trimmed.match(/```\s*([\s\S]*?)\s*```/i);

  if (fenced?.[1]) {
    return JSON.parse(fenced[1].trim());
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  }

  throw new Error("模型回傳內容不是有效 JSON");
}

export default async function handler(req, res) {
  console.log("API 收到請求，方法:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { content, mainKeyword } = req.body ?? {};
    console.log("正在分析關鍵字:", mainKeyword);

    if (!content || !mainKeyword) {
      return res.status(400).json({
        error: "缺少必要參數：content 或 mainKeyword",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("錯誤: 找不到 GEMINI_API_KEY 環境變數");
      return res.status(500).json({
        error: "API Key 未設定，請檢查 Vercel 環境變數",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
你是一位專業的 SEO 策略顧問與 Google 演算法專家。
請針對以下內容進行深度的語義與意圖分析，並結合 Google 最新演算法（E-E-A-T, Helpful Content Update, BERT/MUM）提供優化建議。

主關鍵字：${mainKeyword}
內容：${content}

請嚴格遵守以下分析維度並回傳 JSON 格式：
1. 總體評分 (0-100)
2. 短尾關鍵字分析 (核心詞、出現次數、權重評分、狀態: good/warning/low)
3. 長尾關鍵字分析 (已偵測到的詞、建議補充的詞、意圖覆蓋率)
4. E-E-A-T 評分 (經驗、專業、權威、信任，各 0-100 及具體回饋)
5. 有用內容系統評估 (稀缺性、滿足感，各 0-100 及具體回饋)
6. SERP 缺口分析 (競品平均字數、缺失的主題/關鍵字、差異化策略)
7. 搜尋意圖分類 (Informational, Transactional, Navigational, Commercial)
8. 優化提醒 (包含 type: warning/success/info 和 message)
9. AI 優化建議列表

請只回傳單一 JSON 物件，不要加任何說明、不要加 markdown、不要加 code fence。

JSON 範例格式如下：
{
  "overallScore": 85,
  "shortTailKeywords": [
    {
      "keyword": "SEO",
      "count": 5,
      "score": 88,
      "status": "good"
    }
  ],
  "longTailKeywords": {
    "detected": ["SEO 優化策略", "Google 搜尋排名"],
    "suggested": ["內容品質提升", "E-E-A-T SEO 寫法"],
    "intentCoverage": 78
  },
  "eeat": {
    "experience": {
      "score": 80,
      "feedback": "具備實際案例會更好"
    },
    "expertise": {
      "score": 86,
      "feedback": "內容展現一定專業度"
    },
    "authoritativeness": {
      "score": 72,
      "feedback": "建議補充作者背景與引用來源"
    },
    "trustworthiness": {
      "score": 84,
      "feedback": "可增加具體數據與可信憑據"
    }
  },
  "helpfulContent": {
    "scarcity": {
      "score": 70,
      "feedback": "內容觀點仍可再強化差異性"
    },
    "satisfaction": {
      "score": 82,
      "feedback": "基本可滿足搜尋者需求"
    }
  },
  "serpGap": {
    "avgCompetitorWordCount": 1800,
    "missingTopics": ["案例分析", "常見錯誤"],
    "missingKeywords": ["SEO 工具", "內容優化"],
    "differentiationStrategy": "加入實戰案例與可執行清單"
  },
  "searchIntent": "Informational",
  "alerts": [
    {
      "type": "warning",
      "message": "主關鍵字出現頻率偏低"
    },
    {
      "type": "info",
      "message": "可補充長尾關鍵字來提升語意覆蓋"
    }
  ],
  "aiSuggestions": [
    "增加實際案例與經驗描述",
    "補充權威來源引用",
    "擴展長尾關鍵字段落"
  ]
}

重要：所有回饋、建議與訊息必須使用繁體中文。
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text ?? "";
    console.log("AI 原始輸出:", rawText);

    const parsed = extractJson(rawText);

    console.log("AI 分析完成");
    return res.status(200).json(parsed);
  } catch (error) {
    console.error("API 執行錯誤:", error);

    return res.status(500).json({
      error: "分析失敗",
      detail: error instanceof Error ? error.message : "未知錯誤",
    });
  }
}
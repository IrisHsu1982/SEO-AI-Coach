import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { content, mainKeyword } = await req.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key not configured' }), { status: 500 });
    }

    const genAI = new GoogleGenAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

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
      
      **重要：所有回饋、建議與訊息必須使用「繁體中文」。**
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return new Response(text, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Analysis Error:", error);
    return new Response(JSON.stringify({ error: '分析失敗' }), { status: 500 });
  }
}

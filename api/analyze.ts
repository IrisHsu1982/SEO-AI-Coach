import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // 增加日誌，方便在 Vercel Logs 查看
  console.log("API 收到請求，方法:", req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, mainKeyword } = req.body;
    console.log("正在分析關鍵字:", mainKeyword);
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("錯誤: 找不到 GEMINI_API_KEY 環境變數");
      return res.status(500).json({ error: 'API Key 未設定，請檢查 Vercel 環境變數' });
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
    
    console.log("AI 分析完成");
    res.status(200).json(JSON.parse(text));
  } catch (error) {
    console.error("API 執行錯誤:", error);
    res.status(500).json({ error: '分析失敗: ' + (error instanceof Error ? error.message : '未知錯誤') });
  }
}

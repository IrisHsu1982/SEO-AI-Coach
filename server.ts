import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, SchemaType } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment variables");
  }
  const genAI = new GoogleGenAI(apiKey || "");

  // API Routes
  app.post("/api/analyze", async (req, res) => {
    try {
      const { content, mainKeyword } = req.body;
      
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
      res.json(JSON.parse(text));
    } catch (error) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: "分析失敗，請檢查 API Key 或內容格式。" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

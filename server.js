import express from "express"; 
import cors from "cors"; 
import dotenv from "dotenv"; 
import path from "path"; 
import { fileURLToPath } from "url"; 
 
import { chatWithAI } from "./backend/ai.js"; 
import { 
  getMemory, 
  saveMemory, 
  clearMemory 
} from "./backend/memory.js"; 
 
dotenv.config(); 
 
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 
 
const app = express(); 
const PORT = Number(process.env.PORT || 3000); 
 
app.use(cors()); 
 
app.use( 
  express.json({ 
    limit: "2mb" 
  }) 
); 
 
app.use(express.static(path.join(__dirname, "public"))); 
 
/* ========================= 
   STATUS 
========================= */ 
 
app.get("/api/status", (req, res) => { 
  res.json({ 
    success: true, 
    status: "ONLINE", 
    assistant: "KHUSHI AI", 
    aiConfigured: Boolean(process.env.GROQ_API_KEY), 
    model: 
      process.env.GROQ_MODEL || 
      "openai/gpt-oss-20b", 
    time: new Date().toISOString() 
  }); 
}); 
 
/* ========================= 
   MEMORY 
========================= */ 
 
app.get("/api/memory", async (req, res) => { 
  try { 
    const memory = await getMemory(); 
 
    res.json({ 
      success: true, 
      memory 
    }); 
  } catch (error) { 
    res.status(500).json({ 
      success: false, 
      error: error.message 
    }); 
  } 
}); 
 
app.delete("/api/memory", async (req, res) => { 
  try { 
    await clearMemory(); 
 
    res.json({ 
      success: true, 
      message: "Memory cleared" 
    }); 
  } catch (error) { 
    res.status(500).json({ 
      success: false, 
      error: error.message 
    }); 
  } 
}); 
 
/* ========================= 
   AI CHAT 
========================= */ 
 
app.post("/api/chat", async (req, res) => { 
  try { 
    const message = String( 
      req.body?.message || "" 
    ).trim(); 
 
    const history = Array.isArray( 
      req.body?.history 
    ) 
      ? req.body.history 
      : []; 
 
    if (!message) { 
      return res.status(400).json({ 
        success: false, 
        error: "Message is required" 
      }); 
    } 
 
    if (!process.env.GROQ_API_KEY) { 
      return res.status(500).json({ 
        success: false, 
        error: "GROQ_API_KEY is missing" 
      }); 
    } 
 
    const result = await chatWithAI( 
      message, 
      history 
    ); 
 
    await saveMemory({ 
      role: "user", 
      content: message 
    }); 
 
    await saveMemory({ 
      role: "assistant", 
      content: result.text 
    }); 
 
    res.json({ 
      success: true, 
      reply: result.text, 
      model: result.model 
    }); 
 
  } catch (error) { 
    console.error("AI ERROR:", error); 
 
    res.status(500).json({ 
      success: false, 
      error: 
        error.message || 
        "AI request failed" 
    }); 
  } 
}); 
 
/* ========================= 
   FRONTEND 
========================= */ 
 
app.use((req, res) => { 
  if ( 
    req.method === "GET" && 
    !req.path.startsWith("/api/") 
  ) { 
    return res.sendFile( 
      path.join( 
        __dirname, 
        "public", 
        "index.html" 
      ) 
    ); 
  } 
 
  res.status(404).json({ 
    success: false, 
    error: "Route not found" 
  }); 
}); 
 
/* ========================= 
   START 
========================= */ 
 
app.listen( 
  PORT, 
  "0.0.0.0", 
  () => { 
    console.log(""); 
    console.log( 
      "================================" 
    ); 
    console.log( 
      "        KHUSHI AI v2" 
    ); 
    console.log( 
      "================================" 
    ); 
    console.log( 
      `Local: http://localhost:${PORT}` 
    ); 
    console.log( 
      `Model: ${ 
        process.env.GROQ_MODEL || 
        "openai/gpt-oss-20b" 
      }` 
    ); 
    console.log( 
      "Status: ONLINE" 
    ); 
    console.log( 
      "================================" 
    ); 
    console.log(""); 
  } 
); 
 
 
import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import Replicate from "replicate";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ dest: path.join(__dirname, "uploads/"), limits: { fileSize: 200 * 1024 * 1024 } });
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_,res)=>res.json({ok:true}));

app.post("/api/edit", upload.single("video"), async (req,res)=>{
  if(!process.env.REPLICATE_API_TOKEN) return res.status(500).json({error:"ضع REPLICATE_API_TOKEN في ملف .env أولاً."});
  if(!req.file) return res.status(400).json({error:"ارفع فيديو أولاً."});

  const prompt = (req.body.prompt || "").trim();
  if(!prompt) return res.status(400).json({error:"اكتب البرومبت."});

  try {
    const inputVideo = await fs.promises.readFile(req.file.path);
    // ControlVideo accepts a video file plus a text prompt. The SDK uploads
    // the local file for us.
    const output = await replicate.run("cjwbw/controlvideo", {
      input: {
        prompt,
        video_path: inputVideo,
        condition: req.body.condition || "depth",
        video_length: Number(req.body.video_length || 15),
        num_inference_steps: Number(req.body.steps || 50),
        guidance_scale: Number(req.body.guidance || 12.5),
        is_long_video: false
      }
    });

    const url = typeof output?.url === "function" ? output.url() : String(output);
    res.json({ok:true, url});
  } catch (e) {
    console.error(e);
    res.status(500).json({error:e?.message || "حدث خطأ أثناء معالجة الفيديو."});
  } finally {
    fs.promises.unlink(req.file.path).catch(()=>{});
  }
});

const port=Number(process.env.PORT||3000);
app.listen(port,()=>console.log(`LightFrame AI running on http://localhost:${port}`));
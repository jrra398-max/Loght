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
const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 200 * 1024 * 1024 }
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

app.use(express.json());

// Serve the index.html that is directly in the repository root.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/edit", upload.single("video"), async (req, res) => {
  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({
      error: "REPLICATE_API_TOKEN غير موجود في Railway Variables."
    });
  }

  if (!req.file) {
    return res.status(400).json({ error: "ارفع فيديو أولاً." });
  }

  const prompt = String(req.body.prompt || "").trim();
  if (!prompt) {
    return res.status(400).json({ error: "اكتب البرومبت." });
  }

  try {
    const videoBuffer = await fs.promises.readFile(req.file.path);

    const output = await replicate.run("cjwbw/controlvideo", {
      input: {
        prompt,
        video_path: videoBuffer,
        condition: req.body.condition || "depth",
        video_length: Number(req.body.video_length || 15),
        num_inference_steps: 50,
        guidance_scale: 12.5,
        is_long_video: false
      }
    });

    const url =
      typeof output?.url === "function"
        ? output.url()
        : String(output);

    res.json({ ok: true, url });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error?.message || "حدث خطأ أثناء معالجة الفيديو."
    });
  } finally {
    fs.promises.unlink(req.file.path).catch(() => {});
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => {
  console.log(`LightFrame AI running on port ${port}`);
});
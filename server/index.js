import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import aiRoutes from "./aiRoutes.js";

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const TEMPLATE_DIR = path.resolve(process.cwd(), "Resume_Formats");
const TEMPLATE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function inferTemplateFamily(fileName) {
  const lower = fileName.toLowerCase();

  if (lower.startsWith("developer")) return "developer";
  if (lower.startsWith("designer")) return "designer";
  if (lower.startsWith("account")) return "accountant";
  if (lower.startsWith("admin")) return "classic";
  if (lower.startsWith("it")) return "engineer";
  if (lower.startsWith("picture")) return "photo";
  if (lower.startsWith("mac")) return "modern";
  if (lower.startsWith("fresh")) return "minimal";
  if (lower.startsWith("general")) return "classic";
  if (lower.startsWith("new")) return "modern";

  return "classic";
}

function inferRendererKey(family) {
  const mapping = {
    developer: "prof-developer",
    designer: "modern",
    accountant: "prof-accountant",
    engineer: "prof-engineer",
    photo: "photo",
    modern: "modern",
    minimal: "minimal",
    classic: "classic",
  };

  return mapping[family] || "classic";
}

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/template-assets", express.static(TEMPLATE_DIR));

// Mount AI routes
app.use("/api", aiRoutes);

app.get("/api/template-library", (req, res) => {
  try {
    const files = fs.readdirSync(TEMPLATE_DIR);
    const templates = files
      .filter((fileName) => TEMPLATE_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
      .map((fileName) => {
        const family = inferTemplateFamily(fileName);
        return {
          fileName,
          label: path.parse(fileName).name,
          family,
          rendererKey: inferRendererKey(family),
          url: `/template-assets/${encodeURIComponent(fileName)}`,
        };
      })
      .sort((left, right) => left.fileName.localeCompare(right.fileName, undefined, { numeric: true }));

    res.json({ templates });
  } catch (error) {
    console.error("Template library error:", error);
    res.status(500).json({ error: "Unable to load template library" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Resume Creator API is running" });
});

app.listen(PORT, () => {
  console.log(`✅ Resume Creator API running on http://localhost:${PORT}`);
});

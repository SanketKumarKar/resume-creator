import express from "express";
import cors from "cors";
import aiRoutes from "./aiRoutes.js";

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Mount AI routes
app.use("/api", aiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Resume Creator API is running" });
});

app.listen(PORT, () => {
  console.log(`✅ Resume Creator API running on http://localhost:${PORT}`);
});

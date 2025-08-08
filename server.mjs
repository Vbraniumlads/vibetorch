import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

const distPath = path.join(__dirname, "dist");

// Serve static assets
app.use(express.static(distPath, { maxAge: "1h", extensions: ["html"] }));

// SPA fallback: always send index.html for unknown routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Web server listening on http://0.0.0.0:${port}`);
});

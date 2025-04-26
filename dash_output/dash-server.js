const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8000;
let totalBytesServed = 0;

// Enable CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Manual fallback route
app.use((req, res) => {
  const filePath = path.join(__dirname, decodeURIComponent(req.url));
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      console.log(`[CDN] 404 Not Found: ${filePath}`);
      return res.status(404).send("Not Found");
    }

    totalBytesServed += stats.size;
    console.log(`[CDN] Served ${req.url} (${stats.size} bytes) → Total: ${totalBytesServed} bytes`);
    res.sendFile(filePath);
  });
});

app.listen(PORT, () => {
  console.log(`✅ DASH Server running at http://localhost:${PORT}`);
});

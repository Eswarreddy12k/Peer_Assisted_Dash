const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 9002; // change to 9002/9003 for other peers

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Allow large payloads
app.use(express.json({ limit: "50mb" }));

app.post("/cache", (req, res) => {
  const { name, data } = req.body;
  const filePath = path.join(__dirname, "cache", name);
  fs.writeFile(filePath, Buffer.from(data, "base64"), err => {
    if (err) return res.status(500).send("Write error");
    console.log(`[CACHE] Saved ${name}`);
    res.sendStatus(200);
  });
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.use(express.static(path.join(__dirname, "cache")));

app.listen(PORT, () => {
  console.log(`Peer HTTP server running at http://localhost:${PORT}`);
});

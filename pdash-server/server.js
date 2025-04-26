const express = require("express");
const cors = require("cors");
const generateDynamicMPD = require("./generateMPD");
const fs = require("fs");



const app = express();
app.use(cors());
app.use(express.json());

const peerSegmentMap = {};
const peerStats = {};

setInterval(() => {
  for (const peer of Object.keys(peerSegmentMap)) {
    const start = performance.now();
    fetch(`http://${peer}/ping`).then(() => {
      const rtt = performance.now() - start;
      peerStats[peer] = peerStats[peer] || { rtt: 999, failures: 0, availability: 0 };
      peerStats[peer].rtt = rtt;
    }).catch(() => {
      peerStats[peer] = peerStats[peer] || { rtt: 999, failures: 0, availability: 0 };
      peerStats[peer].rtt = 999;
    });
  }
}, 30000);

app.post("/logSegment", (req, res) => {
    const { peerIP, segment } = req.body;
    peerSegmentMap[peerIP] = peerSegmentMap[peerIP] || new Set();
    peerSegmentMap[peerIP].add(segment);
    peerStats[peerIP] = peerStats[peerIP] || { rtt: 999, failures: 0, availability: 0 };
    peerStats[peerIP].availability++;
    res.sendStatus(200);
});

app.post("/recordFailure", (req, res) => {
    const { peerIP } = req.body;
    peerStats[peerIP] = peerStats[peerIP] || { rtt: 999, failures: 0, availability: 0 };
    peerStats[peerIP].failures++;
    res.sendStatus(200);
});

app.get("/manifest.mpd", async (req, res) => {
    try {
        const mpd = await generateDynamicMPD(peerSegmentMap, peerStats);
        res.set("Content-Type", "application/dash+xml");
        res.send(mpd);
    } catch (err) {
        console.error("MPD generation error:", err);
        res.status(500).send("MPD generation failed");
    }
});


app.get("/peerStats", (req, res) => {
  res.json(peerStats);
});


// Share peerStats for use in generateMPD
module.exports = peerStats;

app.listen(4000, () => console.log("Tracker running on http://localhost:4000"));
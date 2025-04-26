const fs = require("fs");
const xml2js = require("xml2js");

async function generateDynamicMPD(peerSegmentMap, peerStats) {
    const mpdXML = fs.readFileSync("manifest_template.mpd", "utf-8");
    const parser = new xml2js.Parser();
    const builder = new xml2js.Builder();

    const result = await parser.parseStringPromise(mpdXML);
    const mpd = result.MPD;
    const periods = mpd.Period;

    periods.forEach((period) => {
        period.AdaptationSet.forEach((adaptationSet) => {
            adaptationSet.Representation.forEach((rep) => {
                if (!rep.BaseURL) rep.BaseURL = [];
                const segmentToSearch = "chunk-" + rep.$.id + "-3.m4s";

                const sortedPeers = Object.entries(peerSegmentMap)
                    .filter(([peerIP, segments]) => segments.has(segmentToSearch))
                    .sort((a, b) => {
                        const statsA = peerStats[a[0]] || { rtt: 999, failures: 0, availability: 0 };
                        const statsB = peerStats[b[0]] || { rtt: 999, failures: 0, availability: 0 };
                        const scoreA = statsA.rtt + statsA.failures - statsA.availability;
                        const scoreB = statsB.rtt + statsB.failures - statsB.availability;
                        return scoreA - scoreB;
                    });

                sortedPeers.forEach(([peerIP]) => {
                    rep.BaseURL.unshift(`http://${peerIP}/`);
                });

                rep.BaseURL.push("http://localhost:8000/");
            });
        });
    });

    return builder.buildObject(result);
}

module.exports = generateDynamicMPD;

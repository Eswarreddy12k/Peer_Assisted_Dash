import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import open from 'open';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_PORT = 9001;
const BASE_UI_PORT = 8101;
const NUM_PEERS = parseInt(process.argv[2] || '1');

const PEER_TEMPLATE_DIR = path.join(__dirname, 'peer-template');

(async () => {
  for (let i = 0; i < NUM_PEERS; i++) {
    const peerName = `peer${i + 1}`;
    const peerDir = path.join(__dirname, peerName);
    const peerPort = BASE_PORT + i;
    const uiPort = BASE_UI_PORT + i;

    // Create peer folder if it doesn't exist
    if (!fs.existsSync(peerDir)) {
      fs.mkdirSync(peerDir);

      // Copy files from peer-template
      fs.cpSync(PEER_TEMPLATE_DIR, peerDir, { recursive: true });

      // Modify port in peer-server.js
      const peerServerPath = path.join(peerDir, 'peer-server.js');
      let serverCode = fs.readFileSync(peerServerPath, 'utf-8');
      serverCode = serverCode.replace(/const PORT = \d+;/, `const PORT = ${peerPort};`);
      fs.writeFileSync(peerServerPath, serverCode);

      // Modify peerIP in index.html
      const indexPath = path.join(peerDir, 'index.html');
      let htmlCode = fs.readFileSync(indexPath, 'utf-8');
      htmlCode = htmlCode.replace(/const peerIP = "localhost:\d+";/, `const peerIP = "localhost:${peerPort}";`);
      fs.writeFileSync(indexPath, htmlCode);

      console.log(`[SETUP] Created ${peerName} with ports ${peerPort} and ${uiPort}`);
    }

    // Start peer-server.js
    //spawn('node', ['peer-server.js'], { cwd: peerDir, stdio: 'inherit' });

    // Start http-server for index.html
    spawn('npx', ['http-server', '-p', uiPort, '-c-1'], { cwd: peerDir, stdio: 'inherit' });

    // Wait a little bit before opening browser
    await new Promise(resolve => setTimeout(resolve, 1500));
    await open(`http://localhost:${uiPort}/index.html?peers=${NUM_PEERS}`);
  }
})();

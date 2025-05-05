import { exec } from 'child_process';
import os from 'os';

function killProcess(name) {
  const isWin = os.platform() === 'win32';

  const cmd = isWin
    ? `taskkill /F /IM ${name}.exe`
    : `pkill -f ${name}`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(`[ERROR] Failed to kill ${name}:`, err.message);
    } else {
      console.log(`[KILLED] All ${name} processes`);
    }
  });
}

// Kill node processes running peer-server.js
killProcess('peer-server');

// Kill http-server processes
killProcess('http-server');

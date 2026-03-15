import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

// Resolve the first non-internal IPv4 address for local network access logs.
function getLanIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '<your-ip>';
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running (local): http://localhost:${PORT}`);
  console.log(`Server bind:            http://0.0.0.0:${PORT}`);
  console.log(`LAN access:             http://${getLanIP()}:${PORT}`);
});

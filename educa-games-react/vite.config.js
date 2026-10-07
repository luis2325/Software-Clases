import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import https from 'https';

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const LAN_IP = getLocalIP();

// Classroom API Middleware Plugin for Real-Time Teacher Sync
function classroomApiPlugin() {
  const scoresPath = path.resolve(__dirname, 'server-data/scores.json');
  const studentsPath = path.resolve(__dirname, 'server-data/students.json');

  const readJson = (file) => {
    try {
      if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch (e) {}
    return [];
  };

  const writeJson = (file, data) => {
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {}
  };

  const getTunnelInfo = () => {
    const configPath = path.resolve(__dirname, 'public/network-config.json');
    let tunnelUrl = '';
    if (fs.existsSync(configPath)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (cfg.tunnelUrl) tunnelUrl = cfg.tunnelUrl;
      } catch (e) {}
    }

    if (!tunnelUrl) {
      const logFiles = [
        '/tmp/cf_tunnel.log',
        path.resolve(__dirname, 'tools/tunnel.log')
      ];
      for (const lf of logFiles) {
        if (fs.existsSync(lf)) {
          const txt = fs.readFileSync(lf, 'utf-8');
          const m = txt.match(/https:\/\/[a-zA-Z0-9.-]+\.trycloudflare\.com/);
          if (m) {
            tunnelUrl = m[0];
            break;
          }
        }
      }
    }

    return {
      tunnelUrl: tunnelUrl || '',
      lanIp: LAN_IP,
      port: 5173
    };
  };

  return {
    name: 'classroom-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/tunnel' && req.method === 'GET') {
          const info = getTunnelInfo();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(info));
          return;
        }

        if (req.url === '/api/tunnel' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const configPath = path.resolve(__dirname, 'public/network-config.json');
              const cfg = {
                tunnelUrl: data.tunnelUrl || '',
                lanIp: LAN_IP,
                port: 5173
              };
              fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, ...cfg }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.url === '/api/scores' && req.method === 'GET') {
          const scores = readJson(scoresPath);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(scores));
          return;
        }

        if (req.url === '/api/scores' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const newScore = JSON.parse(body);
              const scores = readJson(scoresPath);
              scores.unshift({ ...newScore, id: Date.now().toString(), createdAt: new Date().toISOString() });
              writeJson(scoresPath, scores);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, count: scores.length }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.url === '/api/students' && req.method === 'GET') {
          const students = readJson(studentsPath);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(students));
          return;
        }

        if (req.url === '/api/students' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const newStudent = JSON.parse(body);
              const students = readJson(studentsPath);
              if (!students.some(s => (s.name || '').toLowerCase() === (newStudent.name || '').toLowerCase())) {
                students.push(newStudent);
                writeJson(studentsPath, students);
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, students }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.url === '/api/reset' && (req.method === 'POST' || req.method === 'DELETE')) {
          writeJson(scoresPath, []);
          writeJson(studentsPath, []);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, message: 'All server data cleared' }));
          return;
        }

        // 5. Speech-To-Text Universal Proxy (Para Firefox, Safari, Brave y cualquier navegador)
        if (req.url === '/api/speech' && req.method === 'POST') {
          const chunks = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', () => {
            const audioBuffer = Buffer.concat(chunks);
            if (!audioBuffer || audioBuffer.length === 0) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: 'Audio vacío' }));
              return;
            }

            // Convertir cualquier formato de audio recibido (webm, ogg, wav) a PCM lineal 16kHz mono
            const ffmpeg = spawn('ffmpeg', [
              '-y',
              '-i', 'pipe:0',
              '-ar', '16000',
              '-ac', '1',
              '-f', 's16le',
              'pipe:1'
            ]);

            ffmpeg.on('error', (err) => {
              console.warn('[Speech API] FFmpeg process error:', err.message);
              if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, error: 'FFmpeg error: ' + err.message }));
              }
            });

            const pcmChunks = [];
            ffmpeg.stdout.on('data', d => pcmChunks.push(d));

            ffmpeg.on('close', code => {
              const pcmBuffer = Buffer.concat(pcmChunks);
              if (!pcmBuffer || pcmBuffer.length === 0) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, error: 'Error convirtiendo audio a PCM' }));
                return;
              }

              // Reconocimiento de Voz Google v2 en Español (es-CO)
              const googleReq = https.request('https://www.google.com/speech-api/v2/recognize?client=chromium&lang=es-CO&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw&pFilter=0', {
                method: 'POST',
                headers: {
                  'Content-Type': 'audio/l16; rate=16000',
                  'Content-Length': pcmBuffer.length
                }
              }, googleRes => {
                let body = '';
                googleRes.on('data', c => body += c);
                googleRes.on('end', () => {
                  try {
                    let transcript = '';
                    const lines = body.trim().split('\n');
                    for (const line of lines) {
                      if (!line.trim()) continue;
                      const parsed = JSON.parse(line);
                      if (parsed.result && parsed.result[0] && parsed.result[0].alternative && parsed.result[0].alternative[0]) {
                        transcript = parsed.result[0].alternative[0].transcript;
                        break;
                      }
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ ok: true, transcript }));
                  } catch (e) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ ok: false, error: e.message, raw: body }));
                  }
                });
              });

              googleReq.on('error', err => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, error: err.message }));
              });

              googleReq.write(pcmBuffer);
              googleReq.end();
            });

            ffmpeg.stdin.write(audioBuffer);
            ffmpeg.stdin.end();
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), classroomApiPlugin()],
  define: {
    __LAN_IP__: JSON.stringify(LAN_IP)
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true
  }
});

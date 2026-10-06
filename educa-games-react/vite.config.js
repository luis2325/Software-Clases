import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';
import fs from 'fs';
import path from 'path';

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

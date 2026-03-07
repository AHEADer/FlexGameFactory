import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parentDir = path.resolve(__dirname, '..');

// Custom Plugin to serve the games library
function gameLibraryPlugin() {
  return {
    name: 'game-library',
    configureServer(server) {
      // 1. API endpoint to return list of generated games
      server.middlewares.use('/api/games', (req, res) => {
        try {
          const items = fs.readdirSync(parentDir);
          const games = [];
          for (const item of items) {
            if (item === 'game-factory-fe' || item.startsWith('.') || item === 'node_modules') continue;
            const fullPath = path.join(parentDir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              if (fs.existsSync(path.join(fullPath, 'index.html'))) {
                const hasCover = fs.existsSync(path.join(fullPath, 'cover.png'));
                games.push({
                  id: item,
                  name: item,
                  url: `/games/${item}/index.html`,
                  imageUrl: hasCover ? `/games/${item}/cover.png` : null
                });
              }
            }
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, games }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: e.toString() }));
        }
      });

      // 2. Middleware to statically serve the game files via /games/...
      server.middlewares.use('/games/', (req, res, next) => {
        // e.g. req.url = "/junda/index.html"
        const reqPath = decodeURIComponent(req.url.split('?')[0]);
        const fullPath = path.join(parentDir, reqPath);

        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          const ext = path.extname(fullPath).toLowerCase();
          let mime = 'text/plain';
          if (ext === '.html') mime = 'text/html';
          else if (ext === '.js') mime = 'application/javascript';
          else if (ext === '.mjs') mime = 'application/javascript';
          else if (ext === '.css') mime = 'text/css';
          else if (ext === '.png') mime = 'image/png';
          else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
          else if (ext === '.svg') mime = 'image/svg+xml';
          else if (ext === '.json') mime = 'application/json';
          else if (ext === '.mp3') mime = 'audio/mpeg';
          else if (ext === '.wav') mime = 'audio/wav';

          res.setHeader('Content-Type', mime);
          const stream = fs.createReadStream(fullPath);
          stream.pipe(res);
        } else {
          next();
        }
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), gameLibraryPlugin()],
})

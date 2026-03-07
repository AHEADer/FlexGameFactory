import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const jundaGamesDir = path.resolve(rootDir, 'junda_games');

// Custom Plugin to handle local filesystem features (games library)
function gameLibraryPlugin() {
  return {
    name: 'game-library',
    configureServer(server) {
      // 1. Internal API to scan the local "junda_games" for generated games
      server.middlewares.use('/api/games', (req, res) => {
        try {
          if (!fs.existsSync(jundaGamesDir)) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, games: [] }));
          }
          const items = fs.readdirSync(jundaGamesDir);
          const games = [];
          for (const item of items) {
            if (item.startsWith('.') || item === 'node_modules') continue;
            const fullPath = path.join(jundaGamesDir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              if (fs.existsSync(path.join(fullPath, 'index.html'))) {
                const hasCover = fs.existsSync(path.join(fullPath, 'cover.png'));
                games.push({
                  id: item,
                  name: item.replace(/_/g, ' ').toUpperCase(),
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

      // 2. Middleware to statically serve individual game files from the junda_games directory
      server.middlewares.use('/games/', (req, res, next) => {
        const reqPath = decodeURIComponent(req.url.split('?')[0]);
        const fullPath = path.join(jundaGamesDir, reqPath);

        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          const ext = path.extname(fullPath).toLowerCase();
          const mimeTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.mjs': 'application/javascript',
            '.css': 'text/css',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.json': 'application/json',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav'
          };

          res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
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
  server: {
    proxy: {
      // Proxying /api/news_search directly to the Python server at localhost:8000
      '/api/news_search': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/news_search/, '/news')
      },
      '/api/sync': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sync/, '/sync')
      },
      '/api/agents': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/agents/, '/agents')
      },
      '/api/reviews': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/reviews/, '/reviews')
      },
      '/api/evaluate': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/evaluate/, '/evaluate')
      },
      '/api/funding': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/funding/, '/funding')
      },
      '/api/games': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/games/, '/games')
      }
    }
  }
})

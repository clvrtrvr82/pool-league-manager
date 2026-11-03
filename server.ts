import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
// In AI Studio development, the dev server must always bind to port 3000.
// In production deployments (such as Railway or Docker), use process.env.PORT.
const PORT = isProduction && process.env.PORT ? Number(process.env.PORT) : 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  // API Routes
  app.get('/api/health', async (_req, res) => {
    try {
      const dbStatus = await db.getStatus();
      res.json({
        status: 'ok',
        uptime: process.uptime(),
        environment: isProduction ? 'production' : 'development',
        database: dbStatus,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ status: 'error', error: err.message });
    }
  });

  app.get('/api/status', async (_req, res) => {
    try {
      const status = await db.getStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/tournaments', async (_req, res) => {
    try {
      const list = await db.getTournaments();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/tournaments/current', async (_req, res) => {
    try {
      const data = await db.getActiveTournament();
      res.json({ data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/tournaments/:id', async (req, res) => {
    try {
      const data = await db.getTournament(req.params.id);
      if (!data) return res.status(404).json({ error: 'Tournament not found' });
      res.json({ data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tournaments', async (req, res) => {
    try {
      const { tournament, setActive = true } = req.body;
      if (!tournament || !tournament.config) {
        return res.status(400).json({ error: 'Invalid tournament payload' });
      }
      await db.saveTournament(tournament, setActive);
      res.json({ success: true, id: tournament.config.id });
    } catch (err: any) {
      console.error('[API] Save error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/tournaments/:id', async (req, res) => {
    try {
      const deleted = await db.deleteTournament(req.params.id);
      res.json({ success: deleted });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Serve Frontend
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Pool League Server listening on port ${PORT} [${isProduction ? 'PRODUCTION' : 'DEV'}]`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

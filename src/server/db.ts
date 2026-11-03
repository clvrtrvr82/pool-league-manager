import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

export interface DBStatus {
  connected: boolean;
  type: 'postgres' | 'local_file';
  message: string;
  databaseUrlConfigured: boolean;
}

class DatabaseService {
  private pool: pg.Pool | null = null;
  private isPostgres = false;
  private localFallbackPath: string;
  private inMemoryFallback: Map<string, any> = new Map();
  private activeTournamentId: string | null = null;

  constructor() {
    this.localFallbackPath = path.resolve(process.cwd(), '.local_db.json');
    this.init();
  }

  private async init() {
    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl) {
      try {
        console.log('[DB] Connecting to PostgreSQL database (Railway/Custom)...');
        // Handle SSL for remote connection (Railway requires SSL or accepts rejectUnauthorized false)
        const useSsl = !databaseUrl.includes('localhost') && !databaseUrl.includes('127.0.0.1');

        this.pool = new Pool({
          connectionString: databaseUrl,
          ssl: useSsl ? { rejectUnauthorized: false } : undefined,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });

        // Test connection
        const client = await this.pool.connect();
        try {
          await client.query('SELECT NOW()');
          console.log('[DB] ✅ PostgreSQL connection successful!');
          this.isPostgres = true;

          // Initialize schema
          await this.initSchema(client);
        } finally {
          client.release();
        }
      } catch (err: any) {
        console.error('[DB] ⚠️ PostgreSQL connection failed, falling back to local file storage:', err?.message || err);
        this.isPostgres = false;
        this.pool = null;
        this.loadLocalFallback();
      }
    } else {
      console.log('[DB] ℹ️ DATABASE_URL not set. Running with local fallback storage (offline / preview mode).');
      this.isPostgres = false;
      this.loadLocalFallback();
    }
  }

  private async initSchema(client: pg.PoolClient) {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tournaments (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        data JSONB NOT NULL,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_tournaments_active ON tournaments(is_active);
      CREATE INDEX IF NOT EXISTS idx_tournaments_updated ON tournaments(updated_at DESC);
    `;
    await client.query(createTableQuery);
    console.log('[DB] ✅ Database tables initialized successfully.');
  }

  private loadLocalFallback() {
    try {
      if (fs.existsSync(this.localFallbackPath)) {
        const raw = fs.readFileSync(this.localFallbackPath, 'utf-8');
        const data = JSON.parse(raw);
        if (data.tournaments && Array.isArray(data.tournaments)) {
          for (const item of data.tournaments) {
            this.inMemoryFallback.set(item.id, item);
          }
        }
        if (data.activeTournamentId) {
          this.activeTournamentId = data.activeTournamentId;
        }
      }
    } catch (e) {
      console.error('[DB] Failed reading local fallback file:', e);
    }
  }

  private persistLocalFallback() {
    try {
      const data = {
        activeTournamentId: this.activeTournamentId,
        tournaments: Array.from(this.inMemoryFallback.values()),
      };
      fs.writeFileSync(this.localFallbackPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[DB] Failed writing local fallback file:', e);
    }
  }

  public async getStatus(): Promise<DBStatus> {
    if (this.isPostgres && this.pool) {
      try {
        const res = await this.pool.query('SELECT COUNT(*) as count FROM tournaments');
        return {
          connected: true,
          type: 'postgres',
          message: `PostgreSQL online (${res.rows[0].count} tournament(s) stored)`,
          databaseUrlConfigured: true,
        };
      } catch (err: any) {
        return {
          connected: false,
          type: 'postgres',
          message: `PostgreSQL error: ${err.message}`,
          databaseUrlConfigured: true,
        };
      }
    }

    return {
      connected: true,
      type: 'local_file',
      message: `Local file fallback active (${this.inMemoryFallback.size} tournament(s) in local cache)`,
      databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
    };
  }

  public async getTournaments(): Promise<any[]> {
    if (this.isPostgres && this.pool) {
      const result = await this.pool.query(
        'SELECT id, name, is_active, created_at, updated_at, data->\'config\' as config, jsonb_array_length(data->\'teams\') as teams_count FROM tournaments ORDER BY updated_at DESC'
      );
      return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        isActive: row.is_active,
        startDate: row.config?.startDate || '',
        lastModified: row.updated_at,
        teamsCount: Number(row.teams_count) || 0,
      }));
    }

    return Array.from(this.inMemoryFallback.values()).map((t) => ({
      id: t.id,
      name: t.name,
      isActive: t.id === this.activeTournamentId,
      startDate: t.data?.config?.startDate || '',
      lastModified: t.updatedAt || new Date().toISOString(),
      teamsCount: t.data?.teams?.length || 0,
    }));
  }

  public async getTournament(id: string): Promise<any | null> {
    if (this.isPostgres && this.pool) {
      const result = await this.pool.query('SELECT data FROM tournaments WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;
      return result.rows[0].data;
    }

    const item = this.inMemoryFallback.get(id);
    return item ? item.data : null;
  }

  public async getActiveTournament(): Promise<any | null> {
    if (this.isPostgres && this.pool) {
      const activeRes = await this.pool.query('SELECT data FROM tournaments WHERE is_active = true LIMIT 1');
      if (activeRes.rows.length > 0) {
        return activeRes.rows[0].data;
      }
      // If no active flag, get most recently updated
      const latestRes = await this.pool.query('SELECT data FROM tournaments ORDER BY updated_at DESC LIMIT 1');
      if (latestRes.rows.length > 0) {
        return latestRes.rows[0].data;
      }
      return null;
    }

    if (this.activeTournamentId && this.inMemoryFallback.has(this.activeTournamentId)) {
      return this.inMemoryFallback.get(this.activeTournamentId).data;
    }

    if (this.inMemoryFallback.size > 0) {
      const first = Array.from(this.inMemoryFallback.values())[0];
      return first.data;
    }

    return null;
  }

  public async saveTournament(data: any, setActive = true): Promise<void> {
    const id = data?.config?.id || `tournament_${Date.now()}`;
    const name = data?.config?.name || 'Untitled Tournament';

    if (this.isPostgres && this.pool) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');

        if (setActive) {
          // Unset other active flags
          await client.query('UPDATE tournaments SET is_active = false WHERE is_active = true');
        }

        const query = `
          INSERT INTO tournaments (id, name, data, is_active, updated_at)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE
          SET name = EXCLUDED.name,
              data = EXCLUDED.data,
              is_active = EXCLUDED.is_active,
              updated_at = CURRENT_TIMESTAMP
        `;
        await client.query(query, [id, name, JSON.stringify(data), setActive]);
        await client.query('COMMIT');
        console.log(`[DB] Saved tournament "${name}" (${id}) to PostgreSQL.`);
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
      return;
    }

    // Local fallback
    if (setActive) {
      this.activeTournamentId = id;
    }
    this.inMemoryFallback.set(id, {
      id,
      name,
      data,
      updatedAt: new Date().toISOString(),
    });
    this.persistLocalFallback();
  }

  public async deleteTournament(id: string): Promise<boolean> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('DELETE FROM tournaments WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    }

    const existed = this.inMemoryFallback.delete(id);
    if (this.activeTournamentId === id) {
      this.activeTournamentId = null;
    }
    this.persistLocalFallback();
    return existed;
  }
}

export const db = new DatabaseService();

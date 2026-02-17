const { Pool } = require('pg');
const sqlite = require('./sqlite');

function convertPlaceholders(sql) {
  // Replace '?' with $1, $2... for pg
  let i = 0;
  return sql.replace(/\?/g, () => {
    i += 1;
    return `$${i}`;
  });
}

let mode = 'sqlite';
let pgPool = null;

if (process.env.DATABASE_URL) {
  // If the DATABASE_URL explicitly points to SQLite, keep sqlite mode.
  if (process.env.DATABASE_URL.startsWith('sqlite:')) {
    mode = 'sqlite';
  } else {
    try {
      pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
      mode = 'pg';
    } catch (err) {
      console.warn('DB: Could not initialize Postgres pool, falling back to SQLite', err.message);
      mode = 'sqlite';
    }
  }
}

const sqliteDbPromise = sqlite.getDb;

async function run(sql, ...params) {
  if (mode === 'pg' && pgPool) {
    const q = convertPlaceholders(sql);
    const res = await pgPool.query(q, params);
    return { lastID: res.rows[0]?.id || null, rows: res.rows, rowCount: res.rowCount };
  }
  const db = await sqliteDbPromise();
  return db.run(sql, ...params);
}

async function get(sql, ...params) {
  if (mode === 'pg' && pgPool) {
    const q = convertPlaceholders(sql);
    const res = await pgPool.query(q, params);
    return res.rows[0] || null;
  }
  const db = await sqliteDbPromise();
  return db.get(sql, ...params);
}

async function all(sql, ...params) {
  if (mode === 'pg' && pgPool) {
    const q = convertPlaceholders(sql);
    const res = await pgPool.query(q, params);
    return res.rows || [];
  }
  const db = await sqliteDbPromise();
  return db.all(sql, ...params);
}

async function query(sql, ...params) {
  // Compat layer: aceita SQL com placeholders $1 (Postgres style) ou ? (sqlite style)
  if (mode === 'pg' && pgPool) {
    // Se o SQL veio com '?' converte para $1... para Postgres
    const q = sql.includes('?') ? convertPlaceholders(sql) : sql;
    const res = await pgPool.query(q, params);
    return res;
  }

  // SQLite path: substituir $n por ? para compatibilidade
  const sqliteSql = sql.replace(/\$[0-9]+/g, '?');
  const db = await sqliteDbPromise();
  const trimmed = sqliteSql.trim().toUpperCase();

  if (trimmed.startsWith('SELECT')) {
    const rows = await db.all(sqliteSql, ...params);
    return { rows, rowCount: rows.length };
  }

  if (trimmed.startsWith('INSERT')) {
    const result = await db.run(sqliteSql, ...params);
    return { rows: result.lastID ? [{ id: result.lastID }] : [], rowCount: result.changes || 0, lastID: result.lastID };
  }

  // UPDATE / DELETE / other
  const runRes = await db.run(sqliteSql, ...params);
  return { rows: [], rowCount: runRes.changes || 0, lastID: runRes.lastID };
}

async function close() {
  if (mode === 'pg' && pgPool) {
    await pgPool.end();
  } else {
    const db = await sqliteDbPromise();
    await db.close();
  }
}

module.exports = { run, get, all, query, close, mode };

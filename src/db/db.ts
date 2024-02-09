import { Pool, PoolClient } from 'pg';
import logger from '../logger';

const config = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
};

const pool = new Pool({
  user: config.user,
  password: config.password,
  database: config.database,
  host: config.host,
  port: Number(config.port),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export function query(sql: string, params: string[] = [], debug: boolean = false) {
  if (debug) {
    logger('debug', 'db.query => ', sql, 'with params => ', params);
  }
  return pool.query(sql, params);
}

export function getClient(): Promise<PoolClient> {
  return pool.connect();
}

export async function beingTransaction(): Promise<PoolClient> {
  const client = await pool.connect();
  await client.query('BEGIN');
  return client;
}

export async function commitTransaction(client: PoolClient) {
  await client.query('COMMIT');
  client.release();
}

export async function rollbackTransaction(client: PoolClient) {
  await client.query('ROLLBACK');
  client.release();
}
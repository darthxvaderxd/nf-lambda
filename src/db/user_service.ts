import {
  query,
  beingTransaction,
  commitTransaction,
  rollbackTransaction,
} from './db';
import Role from '../entity/role';
import User from '../entity/user';
import { verify } from './hash';

export async function getUser(
  id: string,
  withRole: boolean = false,
): Promise<User | null> {
  let sql = 'SELECT * FROM users WHERE id = $1';
  const params = [id];

  if (withRole) {
    sql = `
			SELECT 
				u.*, 
				r.id as role_id, 
				r.name as role_name, 
				r.created_at as role_created_at,
				r.updated_at as role_updated_at,
				r.enabled as role_enabled
			FROM users u
			INNER JOIN roles r ON u.role_id = r.id
			WHERE u.id = $1
		`;
  }

  const result = await query(sql, params);

  if (result.rows.length === 0) {
    return null;
  }

  let role = undefined;

  if (withRole) {
    role = new Role(
      result.rows[0].role_id,
      result.rows[0].role_name,
      result.rows[0].role_created_at,
      result.rows[0].role_updated_at,
      result.rows[0].role_enabled,
    );
  }

  const user = new User(
    result.rows[0].username,
    result.rows[0].password,
    result.rows[0].email,
    result.rows[0].role_id,
    role,
    result.rows[0].created_at,
    result.rows[0].updated_at,
    result.rows[0].enabled,
  );

  user.id = result.rows[0].id;

  return user;
}

export async function getUserByUsername(
  username: string,
  withRole: boolean = false,
): Promise<User | null> {
  let sql = 'SELECT * FROM users WHERE username = $1';
  const params = [username];

  if (withRole) {
    sql = `
			SELECT 
				u.*, 
				r.id as role_id, 
				r.name as role_name, 
				r.created_at as role_created_at,
				r.updated_at as role_updated_at,
				r.enabled as role_enabled
			FROM users u
			INNER JOIN roles r ON u.role_id = r.id
			WHERE u.username = $1
		`;
  }

  const result = await query(sql, params);

  if (result.rows.length === 0) {
    return null;
  }

  let role = undefined;

  if (withRole) {
    role = new Role(
      result.rows[0].role_id,
      result.rows[0].role_name,
      result.rows[0].role_created_at,
      result.rows[0].role_updated_at,
      result.rows[0].role_enabled,
    );
  }

  const user = new User(
    result.rows[0].username,
    result.rows[0].password,
    result.rows[0].email,
    result.rows[0].role_id,
    role,
    result.rows[0].created_at,
    result.rows[0].updated_at,
    result.rows[0].enabled,
  );

  user.id = result.rows[0].id;

  return user;
}

export async function saveUser(user: User): Promise<User> {
  const client = await beingTransaction();
  try {
    let sql = '';
    let params = [];

    if (user.id) {
      sql = `
				UPDATE users
				SET 
					username = $1, 
					password = $2, 
					email = $3, 
					role_id = $4, 
					updated_at = NOW(), 
					enabled = $5
				WHERE id = $6
			`;
      params = [
        user.username,
        user.password,
        user.email,
        user.role_id,
        user.enabled,
        user.id,
      ];
    } else {
      sql = `
				INSERT INTO users (
					username, 
					password, 
					email, 
					role_id, 
					created_at, 
					updated_at, 
					enabled
				)
				VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)
				RETURNING id
			`;
      params = [
        user.username,
        user.password,
        user.email,
        user.role_id,
        user.enabled,
      ];
    }

    const result = await client.query(sql, params);

    if (!user.id) {
      user.id = result.rows[0].id;
    }

    await commitTransaction(client);
  } catch (error) {
    await rollbackTransaction(client);
    throw error;
  }

  return user;
}

export async function deleteUser(username: string) {
  const client = await beingTransaction();
  try {
    const sql = 'DELETE FROM users WHERE username = $1';
    const params = [username];
    await client.query(sql, params);
    await commitTransaction(client);
  } catch (error) {
    await rollbackTransaction(client);
    throw error;
  }
}

export async function login(username: string, password: string): Promise<User | null> {
  const user = await getUserByUsername(username);

  if (!user || !verify(password, user.password)) {
    return null;
  }

  return user;
}
import {
  query,
  beingTransaction,
  commitTransaction,
  rollbackTransaction,
} from './db';
import Role from '../entity/role';

export async function getRole(id: string): Promise<Role | null> {
  const sql = 'SELECT * FROM roles WHERE id = $1';
  const params = [id];
  const result = await query(sql, params);

  if (result.rows.length === 0) {
    return null;
  }

  return new Role(
    result.rows[0].id,
    result.rows[0].name,
    result.rows[0].created_at,
    result.rows[0].updated_at,
    result.rows[0].enabled,
  );
}

export async function getRoles(): Promise<Role[]> {
  const sql = 'SELECT * FROM roles';
  const result = await query(sql);
  return result.rows.map((row) => {
    return new Role(
      row.id,
      row.name,
      row.created_at,
      row.updated_at,
      row.enabled,
    );
  });
}

export async function saveRole(role: Role): Promise<Role> {
  const client = await beingTransaction();
  try {
    let sql = '';
    let params = [];

    if (role.id) {
      sql = `
				UPDATE roles
				SET name = $1, updated_at = NOW(), enabled = $3
				WHERE id = $4
			`;
      params = [role.name, role.enabled, role.id];
    } else {
      sql = `
				INSERT INTO roles (name, created_at, updated_at, enabled)
				VALUES ($1, Now(), Now(), $2)
				RETURNING id
			`;
      params = [
        role.name,
        role.enabled,
      ];
    }

    const result = await client.query(sql, params);

    await commitTransaction(client);

    if (!role.id) {
      role.id = result.rows[0].id;
    }
  } catch (error) {
    await rollbackTransaction(client);
    throw error;
  }

  return role;
}

export async function deleteRole(id: string): Promise<void> {
  const client = await beingTransaction();
  try {
    const sql = 'DELETE FROM roles WHERE id = $1';
    const params = [id];
    await client.query(sql, params);
    await commitTransaction(client);
  } catch (error) {
    await rollbackTransaction(client);
    throw error;
  }
}
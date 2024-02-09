import {
  query,
  beingTransaction,
  commitTransaction,
  rollbackTransaction,
} from './db';
import Lambda from '../entity/lambda';
import LambdaExecutions from '../entity/lambda_executions';
import User from '../entity/user';
import { getUser } from './user_service';

export async function getLambda(id: string, loadUser = false): Promise<Lambda> {
  const sql = 'SELECT * FROM lambdas WHERE id = $1';
  const params = [id];

  const result = await query(sql, params);
  let user = null;

  if (loadUser) {
    user = await getUser(result.rows[0].created_by);
  }

  return new Lambda(
    result.rows[0].id,
    result.rows[0].name,
    result.rows[0].description,
    result.rows[0].dockerfile,
    result.rows[0].created_at,
    result.rows[0].updated_at,
    result.rows[0].enabled,
    result.rows[0].created_by,
    user,
  );
}

export async function getLambdas(user_id: string = ''): Promise<Lambda[]> {
  let sql = `
		SELECT
			*.l,
			u.id as user_id,
			u.username,
			u.email,
			u.created_at as user_created_at,
			u.updated_at as user_updated_at,
			u.enabled as user_enabled 
		FROM lambdas l
		join users u on l.created_by = u.id
	`;

  if (user_id) {
    sql += ' WHERE created_by = $1';
  }

  const result = await query(sql);
  return result.rows.map((row) => {
    const user = new User(
      row.username,
      '',
      row.email,
      '',
      undefined,
      row.created_at,
      row.updated_at,
      row.enabled,
    );
    user.id = row.user_id;

    return new Lambda(
      row.id,
      row.name,
      row.description,
      row.dockerfile,
      row.created_at,
      row.updated_at,
      row.enabled,
      row.created_by,
      user,
    );
  });
}

export async function saveLambda(lambda: Lambda): Promise<Lambda> {
  const client = await beingTransaction();
  try {
    let sql = '';
    let params = [];

    if (lambda.id) {
      sql = `
				UPDATE lambdas
				SET name = $1, description = $2, dockerfile = $3, updated_at = NOW(), enabled = $4
				WHERE id = $5
			`;
      params = [
        lambda.name,
        lambda.description,
        lambda.dockerfile,
        lambda.enabled,
        lambda.id,
      ];
    } else {
      sql = `
				INSERT INTO lambdas (name, description, dockerfile, created_at, updated_at, enabled, created_by)
				VALUES ($1, $2, $3, Now(), Now(), $4, $5)
				RETURNING id
			`;
      params = [
        lambda.name,
        lambda.description,
        lambda.dockerfile,
        lambda.enabled,
        lambda.created_by,
      ];
    }

    const result = await client.query(sql, params);

    await commitTransaction(client);

    if (!lambda.id) {
      lambda.id = result.rows[0].id;
    }
  } catch (error) {
    await rollbackTransaction(client);
    throw error;
  } finally {
    client.release(); // this shouldn't be necessary, but just in case
  }
}

export async function deleteLambda(id: string): Promise<void> {
  const client = await beingTransaction();
  try {
    const sql = 'DELETE FROM lambdas WHERE id = $1';
    const params = [id];
    await client.query(sql, params);
    await commitTransaction(client);
  } catch (error) {
    await rollbackTransaction(client);
    throw error;
  } finally {
    client.release(); // this shouldn't be necessary, but just in case
  }
}

export async function getLambdaExecutions(lambda_id: string): Promise<LambdaExecutions[]> {
  const sql = 'SELECT * FROM lambda_executions WHERE lambda_id = $1';
  const params = [lambda_id];

  const result = await query(sql, params);
  return result.rows.map((row) => {
    return new LambdaExecutions(
      row.id,
      row.lambda_id,
      undefined,
      row.created_at,
      row.updated_at,
      row.enabled,
      row.result,
    );
  });
}

export async function saveLambdaExecution(lambdaExecution: LambdaExecutions): Promise<LambdaExecutions> {
  const client = await beingTransaction();
  try {
    let sql = '';
    let params = [];

    if (lambdaExecution.id) {
      sql = `
				UPDATE lambda_executions
				SET lambda_id = $1, updated_at = NOW(), enabled = $3, result = $4
				WHERE id = $5
			`;
      params = [
        lambdaExecution.lambda_id,
        lambdaExecution.enabled,
        lambdaExecution.result,
        lambdaExecution.id,
      ];
    } else {
      sql = `
				INSERT INTO lambda_executions (lambda_id, created_at, updated_at, enabled, result)
				VALUES ($1, Now(), Now(), $2, $3)
				RETURNING id
			`;
      params = [
        lambdaExecution.lambda_id,
        lambdaExecution.enabled,
        lambdaExecution.result,
      ];
    }

    const result = await client.query(sql, params);

    await commitTransaction(client);

    if (!lambdaExecution.id) {
      lambdaExecution.id = result.rows[0].id;
    }
  } catch (error) {
    await rollbackTransaction(client);
    throw error;
  } finally {
    client.release(); // this shouldn't be necessary, but just in case
  }
}
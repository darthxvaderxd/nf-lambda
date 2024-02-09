import {
  getLambda,
  getLambdas,
  saveLambda,
  deleteLambda,
  getLambdaExecutions,
  saveLambdaExecution,
  deleteLambdaExecution,
} from './lambda_service';

import {
  getRole,
  getRoles,
  saveRole,
  deleteRole,
} from './role_service';

import {
  getUser,
  getUserByUsername,
  saveUser,
  deleteUser,
  login,
} from './user_service';

import Lambda from '../entity/lambda';
import LambdaExecution from '../entity/lambda_executions';
import Role from '../entity/role';
import User from '../entity/user';

describe('db', () => {
  describe('lambda_service', () => {
    test('lambda service works as expected', async () => {
      const user: User | null = await getUserByUsername('admin');

      if (!user) {
        throw new Error('User not found');
      }

      const lambda = new Lambda(
        '',
        'test',
        'test',
        'test',
        new Date().toISOString(),
        new Date().toISOString(),
        true,
        user.id,
        user,
      );

      const savedLambda = await saveLambda(lambda);
      expect(savedLambda.id).toBeTruthy();

      const loadedLambda = await getLambda(savedLambda.id, true);
      expect(loadedLambda?.id).toBe(savedLambda.id);
      expect(loadedLambda?.name).toBe('test');
      expect(loadedLambda?.description).toBe('test');
      expect(loadedLambda?.dockerfile).toBe('test');
      expect(loadedLambda?.created_by).toBe(user.id);
      expect(loadedLambda?.user).toBeTruthy();
      expect(loadedLambda?.user?.id).toBe(user.id);

      const lambdas = await getLambdas(user.id);
      expect(lambdas.length).toBeGreaterThan(0);

      await deleteLambda(savedLambda.id);

      const deletedLambda = await getLambda(savedLambda.id);
      expect(deletedLambda).toBeNull();
    });

    test('lambda execution service works as expected', async () => {
      const user: User | null = await getUserByUsername('admin');

      if (!user) {
        throw new Error('User not found');
      }

      const lambda = new Lambda(
        '',
        'test',
        'test',
        'test',
        new Date().toISOString(),
        new Date().toISOString(),
        true,
        user.id,
        user,
      );

      const savedLambda = await saveLambda(lambda);
      expect(savedLambda.id).toBeTruthy();

      const execution = new LambdaExecution(
        '', // id
        savedLambda.id, // lambda_id
        savedLambda,
        '', // created_at
        '', // updated_at
        true, // enabled
        'saved', // result
      );

      const savedExecution = await saveLambdaExecution(execution);
      expect(savedExecution?.id).toBeTruthy();

      const executions = await getLambdaExecutions(savedLambda.id);
      expect(executions.length).toBeGreaterThan(0);

      await deleteLambdaExecution(savedExecution?.id ?? '');
      await deleteLambda(savedLambda.id);

      const deletedLambda = await getLambda(savedLambda.id);
      expect(deletedLambda).toBeNull();
    });
  });

  describe('role_service', () => {
    test('role service works as expected', async () => {
      const role = new Role(
        '',
        'test',
        new Date().toISOString(),
        new Date().toISOString(),
        true,
      );

      const savedRole = await saveRole(role);
      expect(savedRole.id).toBeTruthy();

      const loadedRole = await getRole(savedRole.id);
      expect(loadedRole?.id).toBe(savedRole.id);
      expect(loadedRole?.name).toBe('test');

      const roles = await getRoles();
      expect(roles.length).toBeGreaterThan(0);

      await deleteRole(savedRole.id);

      const deletedRole = await getRole(savedRole.id);
      expect(deletedRole).toBeNull();
    });
  });

  describe('user_service', () => {
    test('user service works as expected', async () => {
      const roles = await getRoles();
      const role = roles[0];

      const user = new User(
        'bob',
        'ross',
        'bobross@bobross.com',
        role.id,
        role,
        '',
        '',
        true,
      );

      user.setPassword('ross');

      const savedUser = await saveUser(user);
      expect(savedUser.id).toBeTruthy();

      const loadedUser = await getUser(savedUser.id, true);
      expect(loadedUser?.id).toBe(savedUser.id);
      expect(loadedUser?.username).toBe('bob');
      expect(loadedUser?.email).toBe('bobross@bobross.com');
      expect(loadedUser?.role_id).toBe(role.id);
      expect(loadedUser?.role).toBeTruthy();
      expect(loadedUser?.role?.id).toBe(role.id);
      expect(loadedUser?.role?.name).toBe(role.name);
      expect(loadedUser?.password).not.toBe('ross');


      const userByUsername = await getUserByUsername('bob', true);
      expect(userByUsername?.id).toBe(savedUser.id);
      expect(userByUsername?.username).toBe('bob');

      await deleteUser(savedUser.username);

      const deletedUser = await getUser(savedUser.id);
      expect(deletedUser).toBeNull();
    });
  });

  test('user login works as expected', async () => {
    const failedLogin = await login('bob', 'ross');
    expect(failedLogin).toBeNull();

    const successLogin = await login('admin', 'password');
    expect(successLogin).toBeTruthy();
  });
});
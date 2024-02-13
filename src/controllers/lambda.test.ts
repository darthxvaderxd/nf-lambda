/* eslint-disable @typescript-eslint/no-explicit-any */
import LambdaController from './lambda';
import WebServer from '../server';
import User from '../entity/user';

jest.mock('../server');

// write jest unit tests for the lambda controller
describe('LambdaController', () => {
  // test that the listLambdas method returns the correct response
  test('listLambdas works', async () => {
    // create a new instance of the lambda controller
    const lambdaController = new LambdaController(new WebServer());
    // create a mock request
    const req = {
      body: {},
      params: {},
    };
    // create a mock response
    const res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    // create a mock user
    const user = {
      id: '48096a2c-2154-4e99-8beb-6a68de5f67a4',
      username: 'admin',
      password: '',
      email: 'admin@localhost',
      role_id: '00000000-0000-0000-0000-000000000001',
      role: null,
      created_at: '2024-02-13T11:09:08.917Z',
      updated_at: '2024-02-13T11:09:08.917Z',
      enabled: true,
    };
    // call the listLambdas method with the mock request, response, and user
    await lambdaController.listLambdas(req as any, res as any, user as User);

    // assert that the response was called with the correct status code and message
    expect(res.writeHead).toHaveBeenCalledWith(200);
  });

  // test that tests user is not authorized for listLambdas
  test('listLambdas fails without user', async () => {
    // create a new instance of the lambda controller
    const lambdaController = new LambdaController(new WebServer());
    // create a mock request
    const req = {
      body: {},
      params: {},
    };
    // create a mock response
    const res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    // create a mock user
    const user = null;
    // call the listLambdas method with the mock request, response, and user
    await lambdaController.listLambdas(req as any, res as any, user);

    // assert that the response was called with the correct status code and message
    expect(res.writeHead).toHaveBeenCalledWith(401);
    expect(res.end).toHaveBeenCalledWith('Unauthorized Request');
  });
});
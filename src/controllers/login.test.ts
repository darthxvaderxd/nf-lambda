/* eslint-disable @typescript-eslint/no-explicit-any */
import LoginController, { LoginRequest } from './login';
import WebServer from '../server';

// write jest unit tests for the login controller
jest.mock('../server');
describe('LoginController', () => {
  // test that the login method returns the correct response
  test('login works with username / password', async () => {
    // create a new instance of the login controller
    const loginController = new LoginController(new WebServer());
    // create a mock request
    const req = {
      body: {
        username: 'admin',
        password: 'password',
      },
    };
    // create a mock response
    const res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    // call the login method with the mock request and response
    await loginController.login(req as LoginRequest, res as any);
    // assert that the response was called with the correct status code and message
    expect(res.writeHead).toHaveBeenCalledWith(200);
  });

  // test that a failed login returns the correct response
  test('login fails with invalid username / password', async () => {
    // create a new instance of the login controller
    const loginController = new LoginController(new WebServer());
    // create a mock request
    const req = {
      body: {
        username: 'admin',
        password: 'wrongpassword',
      },
    };
    // create a mock response
    const res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    // call the login method with the mock request and response
    await loginController.login(req as LoginRequest, res as any);
    // assert that the response was called with the correct status code and message
    expect(res.writeHead).toHaveBeenCalledWith(401);
    expect(res.end).toHaveBeenCalledWith('Invalid username or password');
  });
});

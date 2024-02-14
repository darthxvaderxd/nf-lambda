/* eslint-disable @typescript-eslint/no-explicit-any */
import auth from './auth';

describe('auth', () => {
  test('auth works as expected when incorrect login', async () => {
    const req = {
      rawHeaders: [],
    };
    const res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    const next = jest.fn();
    await auth(req as any, res as any, next);
    expect(res.writeHead).toHaveBeenCalledWith(401);
  });

  test('auth works as expected when correct login', async () => {
    const req = {
      rawHeaders: [
        'Authorization',
        `Basic ${Buffer.from('admin:password').toString('base64')}`,
      ],
    };
    const res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    const next = jest.fn();
    await auth(req as any, res as any, next);
    expect(res.writeHead).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});

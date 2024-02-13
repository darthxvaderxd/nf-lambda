/* eslint-disable @typescript-eslint/no-explicit-any */
import IndexController from './index';
import WebServer from '../server';

jest.mock('../server');

describe('IndexController', () => {
  test('index works', async () => {
    const indexController = new IndexController(new WebServer());
    const req = {};
    const res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    await indexController.index(req as any, res as any);
    expect(res.writeHead).toHaveBeenCalledWith(200);
  });
});

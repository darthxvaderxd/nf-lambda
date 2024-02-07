import { initServer } from './server-helper';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';

const mockCallBack = () => {};


jest.mock('http',  () => ({
  createServer: jest.fn(() => ({ listen: jest.fn() })),
}));
jest.mock('https', () => ({
  createServer: jest.fn(() => ({ listen: jest.fn() })),
}));
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  process.env.USE_SSL = 'false';
  delete process.env.SSL_KEY;
  delete process.env.SSL_CERT;
});

describe('initServer', () => {
  test('should call http.createServer.listen', () => {
    initServer(mockCallBack);
    expect(http.createServer).toHaveBeenCalled();
    expect(https.createServer).not.toHaveBeenCalled();
  });

  test('should call https.createServer.listen', () => {
    process.env.USE_SSL = 'true';
    process.env.SSL_KEY = 'blah';
    process.env.SSL_CERT = 'blah';

    initServer(mockCallBack);
    expect(https.createServer).toHaveBeenCalled();
    expect(http.createServer).not.toHaveBeenCalled();
    expect(fs.readFileSync).toHaveBeenCalledTimes(2);
  });

  test('should thrown an error if SSL options are not defined', () => {
    process.env.USE_SSL = 'true';

    expect(() => initServer(mockCallBack))
      .toThrowError('SSL options are not defined');
  });
});
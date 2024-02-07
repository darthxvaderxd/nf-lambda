import * as http from 'http';
import Server from './index';

let serverMock: (cb: (reg: any, res: any) => void) => void = () => {};

const mockRequest = {
	method: 'GET',
	url: '/',
	connection: {
		remoteAddress: '127.0.0.1',
	},
};

jest.mock('http', () => ({
	createServer: (cb: (cb: (reg: any, res: any) => void) => void) => {
		serverMock(cb)
		return {
			listen: jest.fn()
		};
	},
}));

jest.mock('../logger');

describe('Server', () => {
	test('get route should work', () => {
		const server = new Server();

		const mockCB = jest.fn();
		server.get('/', mockCB);

		const mockReq = {
			...mockRequest,
			on: jest.fn((text: string, cb: any) => {
				cb();
			}),
		};
		const mockRes = {
			end: jest.fn(),
			on: jest.fn(),
		};

		serverMock = jest.fn((cb: any) => {
			cb(mockReq, mockRes);
		});

		server.start();

		expect(mockCB).toHaveBeenCalled();
		expect(mockReq.on).toHaveBeenCalled();
		expect(mockRes.end).not.toHaveBeenCalled();
	});

	test('post route should work', () => {
		const server = new Server();

		const mockCB = jest.fn();
		server.post('/', mockCB);

		const mockReq = { ...mockRequest, method: 'POST' };
		const mockRes = {
			end: jest.fn(),
			on: jest.fn(),
		};

		serverMock = jest.fn((cb: any) => {
			cb(mockReq, mockRes);
		});

		server.start();

		expect(mockCB).toHaveBeenCalled();
		expect(mockRes.end).not.toHaveBeenCalled();
	});

	test('put route should work', () => {
		const server = new Server();

		const mockCB = jest.fn();
		server.put('/', mockCB);

		const mockReq = {
			...mockRequest,
			method: 'PUT',
			on: jest.fn((text: string, cb: any) => {
				cb();
			}),
		};

		const mockRes = {
			end: jest.fn(),
			on: jest.fn(),
		};

		serverMock = jest.fn((cb: any) => {
			cb(mockReq, mockRes);
		});

		server.start();

		expect(mockCB).toHaveBeenCalled();
		expect(mockReq.on).toHaveBeenCalled();
		expect(mockRes.end).not.toHaveBeenCalled();
	});

	test('delete route should work', () => {
		const server = new Server();

		const mockCB = jest.fn();
		server.delete('/', mockCB);

		const mockReq = { ...mockRequest, method: 'DELETE' };
		const mockRes = {
			end: jest.fn(),
			on: jest.fn(),
		};

		serverMock = jest.fn((cb: any) => {
			cb(mockReq, mockRes);
		});

		server.start();

		expect(mockCB).toHaveBeenCalled();
		expect(mockRes.end).not.toHaveBeenCalled();
	});

	test('404 should happen when route not found', async () => {
		const server = new Server();

		const mockReq = {
			...mockRequest,
			url: '/not-found',
			on: jest.fn((text: string, cb: any) => {
				cb();
			}),
		};
		const mockRes = {
			end: jest.fn(),
			on: jest.fn(),
			writeHead: jest.fn(),
		};

		serverMock = jest.fn((cb: any) => {
			cb(mockReq, mockRes);
		});

		server.start();

		expect(mockRes.writeHead).toHaveBeenCalledWith(404);
		expect(mockReq.on).not.toHaveBeenCalled();
		expect(mockRes.end).toHaveBeenCalled();
	});

	test('should parse JSON body', async () => {
		const server = new Server();

		let mockBody = {};
		server.post('/', (req) => {
			mockBody = req.body;
		});

		const mockReq = {
			...mockRequest,
			method: 'POST',
			on: jest.fn((text: string, cb: any) => {
				if (text === 'data') {
					cb(JSON.stringify({ foo: 'bar' }));
				} else {
					cb();
				}
			}),
			headers: {
				'content-type': 'application/json',
			},
		};

		const mockRes = {
			end: jest.fn(),
			on: jest.fn(),
		};

		serverMock = jest.fn((cb: any) => {
			cb(mockReq, mockRes);
		});

		server.start();

		expect(mockBody).toEqual({ foo: 'bar' });
	});

	test('should handle error when parsing JSON body', async () => {
		const server = new Server();

		server.post('/', jest.fn());

		const mockReq = {
			...mockRequest,
			method: 'POST',
			on: jest.fn((text: string, cb: any) => {
				if (text === 'data') {
					cb('invalid JSON');
				} else {
					cb();
				}
			}),
			headers: {
				'content-type': 'application/json',
			},
		};

		const mockRes = {
			end: jest.fn(),
			on: jest.fn(),
			writeHead: jest.fn(),
		};

		serverMock = jest.fn((cb: any) => {
			cb(mockReq, mockRes);
		});

		server.start();

		expect(mockRes.writeHead).toHaveBeenCalledWith(400);
		expect(mockRes.end).toHaveBeenCalled();
	});
});
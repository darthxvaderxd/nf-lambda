import { initServer } from './server-helper';
import logger from '../logger';

const port = process.env?.PORT ?? 3000;

export interface Routes {
	method: string;
	path: string;
    handler: (req: any, res: any) => void;
}

export default class Server {
    private server: any;
    private routes: Routes[] = [];

	private getRoute(method: string, path: string) {
		// TODO: we need to be able to implement wildcard routes
		return this.routes.find(route => route.method === method && route.path === path);
	}

    private handleRequest(req: any, res: any) {
		const route = this.getRoute(req.method, req.url);

		logger('info', `${req.connection.remoteAddress} requesting ${req.method} ${req.url}`);

		// set a timeout for the request
	    const timmy = setTimeout(() => {
			logger('warn', `${req.connection.remoteAddress} timed out for ${req.method} ${req.url}`);
			res.writeHead(408);
			res.end();
		}, 5000);

		// log when the response is finished
	    res.on('finish', () => {
			clearTimeout(timmy);
		    logger('info', `${req.connection.remoteAddress} finished ${res.statusCode} for ${req.method} ${req.url}`);
	    });

		if (!route) {
			res.writeHead(404);
			res.end();
			return;
		}

		route.handler(req, res);
    }

	constructor() {
		this.server = initServer((req: any, res: any) => this.handleRequest(req, res));
	}

    public start() {
		this.server.listen(port, () => {
			logger('info', `Server is listening on port ${port}`);
		});
    }

	public get(path: string, handler: (req: any, res: any) => void) {
		this.routes.push({ method: 'GET', path, handler });
	}

	public post(path: string, handler: (req: any, res: any) => void) {
		this.routes.push({ method: 'POST', path, handler });
	}

	public put(path: string, handler: (req: any, res: any) => void) {
		this.routes.push({ method: 'PUT', path, handler });
	}

	public delete(path: string, handler: (req: any, res: any) => void) {
		this.routes.push({ method: 'DELETE', path, handler });
	}
}
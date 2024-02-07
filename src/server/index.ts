import { IncomingMessage, ServerResponse, Server } from 'http';
import { initServer } from './server-helper';
import logger from '../logger';

interface Request extends IncomingMessage {
  body: string | object | undefined;
}

const port = process.env?.PORT ?? 3000;

export interface Routes {
  method: string;
  path: string;
  handler: (req: Request, res: ServerResponse) => void;
}

export default class WebServer {
  private server: Server<typeof IncomingMessage, typeof ServerResponse> | undefined;

  private routes: Routes[] = [];

  private getRoute(method: string, path: string) {
    // TODO: we need to be able to implement wildcard routes
    return this.routes.find(route => route.method === method && route.path === path);
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse) {
    const route = this.getRoute(req?.method ?? '', req?.url ?? '');

    logger('info', `${req.connection.remoteAddress} requesting ${req.method} ${req.url}`);

    // set a timeout for the request
    const timmy = setTimeout(() => {
      logger('warn', `${req.connection.remoteAddress} timed out for ${req.method} ${req.url}`);
      res.writeHead(408);
      res.end();
    }, 5000);

    if (!route) {
      res.writeHead(404);
      res.end();
      return;
    }

    if (!req.on) {
      // @ts-ignore
      return route.handler({ ...req, body: '' }, res);
    }

    res.on('finish', () => {
	  clearTimeout(timmy);
	  logger('info', `${req.connection.remoteAddress} finished ${res.statusCode} for ${req.method} ${req.url}`);
	});

    let body = '';
    req.on('data', (chunk: string) => {
      body += chunk;
    });

    req.on('end', () => {
      // try to parse the body as JSON
      if (
        req?.headers?.['content-type'] === 'application/json'
				&& req.method !== 'GET'
				&& body !== ''
      ) {
        try {
          body = JSON.parse(body);
        } catch (e) {
          logger('error', e);
          res.writeHead(400);
          res.end();
          return;
        }
      }

      // @ts-ignore
      route.handler({ ...req, body }, res);
    });
  }

  public start() {
	this.server = initServer((req: IncomingMessage, res: ServerResponse) => this.handleRequest(req, res));
    this.server.listen(port, () => {
      logger('info', `Server is listening on port ${port}`);
    });
  }

  public get(path: string, handler: (req: IncomingMessage, res: ServerResponse) => void) {
    this.routes.push({ method: 'GET', path, handler });
  }

  public post(path: string, handler: (req: IncomingMessage, res: ServerResponse) => void) {
    this.routes.push({ method: 'POST', path, handler });
  }

  public put(path: string, handler: (req: IncomingMessage, res: ServerResponse) => void) {
    this.routes.push({ method: 'PUT', path, handler });
  }

  public delete(path: string, handler: (req: IncomingMessage, res: ServerResponse) => void) {
    this.routes.push({ method: 'DELETE', path, handler });
  }
}
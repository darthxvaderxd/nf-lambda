import { IncomingMessage, ServerResponse, Server } from 'http';
import { initServer } from './server-helper';
import logger from '../logger';

interface Request extends IncomingMessage {
  body: string | object | undefined;
  params: { [key: string]: string };
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
    // TODO: add support for wildcard routes with more than one parameter
    return this.routes.find(route =>
      (route.method === method && route.path === path)
        // search for wildcard routes with string that starts with colon ends with slash using regex
        || (
          route.method === method
          && new RegExp(`^${route.path.replace(/:\w+/, '\\w+')
            .replace(/\//, '\\/')}$`)
            .test(path)
        ),
    );
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse) {
    const route = this.getRoute(req?.method ?? '', req?.url ?? '');
    const params: { [key: string]: string } = {};

    logger('info', `${req.connection.remoteAddress} requesting ${req.method} ${req.url}`);

    if (!route) {
      res.writeHead(404);
      res.end();
      return;
    }

    if (route?.path.includes(':')) {
      const routeParts = route.path.split('/');
      const reqParts = req.url?.split('/');
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
          const key: string = routeParts[i].substring(1);
          if (key && reqParts?.[i]) {
            params[key] = reqParts?.[i];
          }
        }
      }
    }

    // set a timeout for the request
    const timmy = setTimeout(() => {
      logger('warn', `${req.connection.remoteAddress} timed out for ${req.method} ${req.url}`);
      res.writeHead(408);
      res.end();
    }, 5000);

    if (!req.on) {
      // @ts-ignore
      return route.handler({ ...req, body: '', params }, res);
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
      route.handler({ ...req, body, params }, res);
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
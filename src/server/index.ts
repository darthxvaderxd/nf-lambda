import { IncomingMessage, ServerResponse, Server } from 'http';
import { initServer } from './server-helper';
import logger from '../logger';

interface Request extends IncomingMessage {
  body: string | object | undefined;
  params?: { [key: string]: string };
  query?: { [key: string]: string };
}

const port = process.env?.PORT ?? 3000;

export interface Route {
  method: string;
  path: string;
  handler: (req: Request, res: ServerResponse) => void;
}

export default class WebServer {
  private server: Server<typeof IncomingMessage, typeof ServerResponse> | undefined;

  private routes: Route[] = [];

  private getUsablePathString(path: string): string {
    // remove the last slash if it exists and remove query parameters
    const queryRemoved = path.split('?')[0];
    return  queryRemoved.endsWith('/') && queryRemoved.length > 1
      ? queryRemoved.slice(0, -1)
      : queryRemoved;
  }

  // We need to account for the possibility of a request with query parameters
  // We also need to account for the possibility the path having a trailing slash
  // We need to account for the possibility the url route having :id or similar in it
  // TODO: add support for wildcard routes with more than one parameter
  private getRoute(method: string, path: string): Route | undefined {
    const usablePathString = this.getUsablePathString(path);
    return this.routes.find(route =>
      (route.method === method && route.path === usablePathString)
        // search for wildcard routes with string that starts with colon ends with slash or end of string using regex
        || (
          route.method === method
          && new RegExp(`^${route.path.replace(/:\w+/, '\\w+')
            .replace(/\//, '\\/')}$`)
            .test(usablePathString)
        ),
    );
  }

  private getParams(routePath: string, reqPath: string) {
    if (!routePath.includes(':')) return {};

    const routeParts = routePath.split('/');
    const reqParts = reqPath.split('/');
    const params: { [key: string]: string } = {};
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        const key: string = routeParts[i].substring(1);
        if (key && reqParts[i]) {
          params[key] = reqParts[i];
        }
      }
    }
    return params;
  }

  private getQuery(url: string) {
    const query = url.split('?')[1];
    if (!query) return {};
    const queryParts = query.split('&');
    const queryObj: { [key: string]: string } = {};
    queryParts.forEach((part) => {
      const [key, value] = part.split('=');
      queryObj[key] = value;
    });
    return queryObj;
  }

  private doOns(cb: (body: string | object | undefined) => void, req: Request, res: ServerResponse) {
    res.on('finish', () => {
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
      cb(body);
    });
  }

  private sendOptions(req: IncomingMessage, res: ServerResponse) {
    const usablePathString = this.getUsablePathString(req.url ?? '');
    const routes = this.routes.filter(route => (
      route.path === usablePathString
        || new RegExp(`^${route.path.replace(/:\w+/, '\\w+')
          .replace(/\//, '\\/')}$`)
          .test(usablePathString)
    ));

    if (routes.length > 0) {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': routes.map(route => route.method).join(', '),
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      res.end();
    } else {
      res.writeHead(404);
      res.end();
    }
  }

  // TODO: clean this up, holy hell its a mess now
  private handleRequest(req: IncomingMessage, res: ServerResponse) {
    const route = this.getRoute(req?.method ?? '', req?.url ?? '');
    logger('info', `${req.connection.remoteAddress} requesting ${req.method} ${req.url}`);

    if (req.method === 'OPTIONS') {
      this.sendOptions(req, res);
      return;
    }

    if (!route) {
      res.writeHead(404);
      res.end();
      return;
    }

    const params = this.getParams(route.path, req.url ?? '');
    const query = this.getQuery(req.url ?? '');

    // set a timeout for the request
    const timmy = setTimeout(() => {
      logger('warn', `${req.connection.remoteAddress} timed out for ${req.method} ${req.url}`);
      res.writeHead(408);
      res.end();
    }, 5000);

    if (!req.on) {
      // @ts-ignore
      return route.handler({ ...req, body: '', params, query }, res);
    }

    this.doOns(async (body) => {
      // @ts-ignore
      await route.handler({ ...req, body, params, query }, res);
      clearTimeout(timmy);
    }, req as Request, res);
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
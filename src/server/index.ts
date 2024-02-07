import { IncomingMessage, ServerResponse, Server } from 'http';
import { initServer } from './server-helper';
import logger from '../logger';

export interface Request extends IncomingMessage {
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

  // get the parameters from the route path and the request path
  private getParams(routePath: string, reqPath: string): { [key: string]: string } {
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

  // get the query parameters from the request url
  private getQuery(url: string): { [key: string]: string } {
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

  // handle the data and end events for the request
  private doOns(startTime: number, cb: (body: string | object | undefined) => void, req: Request, res: ServerResponse) {
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

      res.on('finish', () => {
        const responseTime = this.calculateResponseTime(startTime);
        logger('info', `${req.connection.remoteAddress} finished ${res.statusCode} for ${req.method} ${req.url} in ${responseTime}ms`);
      });

      // @ts-ignore
      cb(body);
    });
  }

  // send the options for the request
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

  // calculate the response time for the request
  private calculateResponseTime(startTime: number) {
    return Date.now() - startTime;
  }

  // run the route handler
  private async runRouteHandler(req: Request, res: ServerResponse, route: Route) {
    const params = this.getParams(route.path, req.url ?? '');
    const query = this.getQuery(req.url ?? '');

    req.params = params;
    req.query = query;

    await route.handler(req, res);
  }

  // the heart of the server, this handles the request
  private handleRequest(req: IncomingMessage, res: ServerResponse) {
    const startTime = Date.now();
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

    // set a timeout for the request
    const timmy = setTimeout(() => {
      const responseTime = this.calculateResponseTime(startTime);
      logger('warn', `${req.connection.remoteAddress} timed out for ${req.method} ${req.url} after ${responseTime}ms`);
      res.writeHead(408);
      res.end();
    }, Number(process.env.HTTP_TIMEOUT ?? 5000));

    if (!req.on) {
      return this.runRouteHandler(req as Request, res, route);
    }

    this.doOns(startTime, async (body) => {
      // @ts-ignore
      await this.runRouteHandler({ ...req, body } as Request, res, route);
      clearTimeout(timmy);
    }, req as Request, res);
  }

  // start the server
  public start() {
    this.server = initServer((req: IncomingMessage, res: ServerResponse) => this.handleRequest(req, res));
    this.server.listen(port, () => {
      logger('info', `Server is listening on port ${port}`);
    });
  }

  // add a route to the server with the GET method
  public get(path: string, handler: (req: IncomingMessage, res: ServerResponse) => void) {
    this.routes.push({ method: 'GET', path, handler });
  }

  // add a route to the server with the POST method
  public post(path: string, handler: (req: IncomingMessage, res: ServerResponse) => void) {
    this.routes.push({ method: 'POST', path, handler });
  }

  // add a route to the server with the PUT method
  public put(path: string, handler: (req: IncomingMessage, res: ServerResponse) => void) {
    this.routes.push({ method: 'PUT', path, handler });
  }

  // add a route to the server with the DELETE method
  public delete(path: string, handler: (req: IncomingMessage, res: ServerResponse) => void) {
    this.routes.push({ method: 'DELETE', path, handler });
  }
}
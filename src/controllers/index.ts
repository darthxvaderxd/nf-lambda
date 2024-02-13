import BaseController from './base-controller';
import { ServerResponse } from 'http';
import { Request } from '../server';

export default class IndexController extends BaseController {
  public async index(req: Request, res: ServerResponse) {
    res.writeHead(200);
    res.end('Hello World from NF-Lambda!');
  }

  public initRoutes() {
    this.server.get('/', this.index);
  }
}
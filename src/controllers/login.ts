import { ServerResponse, IncomingMessage } from 'http';
import BaseController from './base-controller';
import User from '../entity/user';
import { login } from '../db/user_service';
import logger from '../logger';

export interface LoginRequest extends IncomingMessage {
  body?: {
    username: string;
    password: string;
  };
}

export default class LoginController extends BaseController {
  public async login(req: LoginRequest, res: ServerResponse) {
    const { username, password } = req?.body || {};

    if (!username || !password) {
      res.writeHead(400);
      res.end('Username and password are required');
      logger('info', 'login attempted without username or password');
      return;
    }

    const user: User | null = await login(username, password);

    if (!user) {
      res.writeHead(401);
      res.end('Invalid username or password');
      logger('info', `login failed for user ${username}`);
      return;
    }

    // don't send the password back
    user.password = '';
    res.writeHead(200);
    logger('info', `login successful for user ${username}`);
    res.end(JSON.stringify(user));
  }

  public initRoutes() {
    this.server.post('/login', this.login);
  }
}
import WebServer from '../server';

export default abstract class BaseController {
  protected server: WebServer;

  abstract initRoutes(): void;

  constructor(server: WebServer) {
    this.server = server;
    this.initRoutes();
  }
}
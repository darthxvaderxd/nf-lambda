import Server from './server';
import WebServer from './server';
import LoginController from './controllers/login';
import IndexController from './controllers';
import LambdaController from './controllers/lambda';
import logger from './logger';

const server: WebServer = new Server();
server.start();

const controllers = [
  new IndexController(server),
  new LoginController(server),
  new LambdaController(server),
];

logger('info', `${controllers.length} controllers initialized`);

server.printRoutes();
import Server, { Request } from './server';
import logger from './logger';
import { login } from './db/user_service';
import User from './entity/user';
import auth from './server/auth';

const server = new Server();
server.start();

server.get('/', (req, res) => {
  res.writeHead(200);
  res.end('Hello World from NF-Lambda!');
});

server.get('/lambdas', (req, res) => {
  auth(req, res, () => {
    res.writeHead(200);
    res.end('Lambdas');
  });
});

server.post('/login', async (req: Request, res) => {
  const { username, password } = req?.body as { username: string, password: string } || {};

  if (!username || !password) {
    logger('info', 'Invalid login attempt username and password are required');

    res.writeHead(400);
    res.end('Username and password are required');

    return;
  }

  const user: User | null = await login(username, password);

  if (!user) {
    logger('info', `Invalid login attempt: ${username}`);

    res.writeHead(401);
    res.end('Invalid username or password');

    return;
  }

  // don't send the password back
  user.password = '';
  logger('info', `User logged in: ${username}`);

  res.writeHead(200);
  res.end(JSON.stringify({ user }));
});
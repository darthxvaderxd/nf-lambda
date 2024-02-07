import Server from './server';
import logger from './logger';

const server = new Server();
server.start();

server.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!');
});

server.get('/timeout', async (req, res) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 6000));
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!');
  } catch (e) {
    logger('error', e);
  }
});
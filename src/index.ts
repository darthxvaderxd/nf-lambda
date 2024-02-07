import Server from './server';
import logger from './logger';

const server = new Server();
server.start();

server.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!');
});

server.post('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!');
});

server.get('/test/:id', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  // @ts-ignore
  res.end(`Hello, ${req.params.id}!`);
});

server.get('/test/:id/more', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  // @ts-ignore
  res.end(`Hello, ${req.params.id} ${req.params.last}! Theres more`);
});

server.get('/query', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  // @ts-ignore
  res.end(JSON.stringify({ query: req.query }));
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
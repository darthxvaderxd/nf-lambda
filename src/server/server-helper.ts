import http, { IncomingMessage, ServerResponse } from 'http';
import https from 'https';
import { readFileSync } from 'fs';

const getSslOptions = () => {
  const sslKey = process.env?.SSL_KEY;
  const sslCert = process.env?.SSL_CERT;

  if (sslKey && sslCert) {
    return {
      key: readFileSync(sslKey),
      cert: readFileSync(sslCert),
    };
  }
  return undefined;
};

const getHttpServer = (cb: (req: IncomingMessage, res: ServerResponse) => void) => {
  return http.createServer(cb);
};

const getHttpsServer = (cb: (req: IncomingMessage, res: ServerResponse) => void) => {
  const sslOptions = getSslOptions();
  if (sslOptions) {
    return https.createServer(sslOptions, cb);
  }
  throw new Error('SSL options are not defined');
};


const initServer = (cb: (req: IncomingMessage, res: ServerResponse) => void) => {
  const useHttps = process.env?.USE_SSL === 'true';
  return useHttps
    ? getHttpsServer(cb)
    : getHttpServer(cb);
};

export { initServer };
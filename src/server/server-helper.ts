import http from 'http';
import https from 'https';
import { readFileSync } from 'fs';

const sslKey = process.env?.SSL_KEY;
const sslCert = process.env?.SSL_CERT;
const useHttps = process.env?.USE_HTTPS === 'true';

const getSslOptions = () => {
  if (sslKey && sslCert) {
	return {
	  key: readFileSync(sslKey),
	  cert: readFileSync(sslCert),
	};
  }
  return undefined;
}

const getHttpServer = (cb: (req: any, res: any) => void) => {
	return http.createServer(cb);
}

const getHttpsServer = (cb: (req: any, res: any) => void) => {
	const sslOptions = getSslOptions();
	if (sslOptions) {
		return https.createServer(sslOptions, cb);
	}
	throw new Error('SSL options are not defined');
}


const initServer = (cb: (req: any, res: any) => void) => {
	const sslOptions = getSslOptions();
	return useHttps
		? getHttpsServer(cb)
	    : getHttpServer(cb);
}

export { initServer };
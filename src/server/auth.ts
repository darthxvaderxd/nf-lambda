import { IncomingMessage, ServerResponse } from 'http';
import { login } from '../db/user_service';
import User from '../entity/user';

export default async function (
  req: IncomingMessage,
  res: ServerResponse,
  next: (req: IncomingMessage, res: ServerResponse, user: User) => Promise<void>,
) {
  // @ts-ignore
  const headers: { [key: string]: string; } = {};

  // for some reason the headers are not in the IncomingMessage type
  for (let i = 0; i < req.rawHeaders.length; i += 2) {
    headers[req.rawHeaders[i].toLowerCase()] = req.rawHeaders[i + 1];
  }

  if (!headers?.authorization) {
    res.writeHead(401);
    res.end('Unauthorized Request');
    return;
  }

  const parts = headers.authorization.split(' ');
  const [username, password] = Buffer.from(
	  parts?.[1],
	  'base64',
  ).toString().split(':');

  const user = await login(username, password);
  if (!user) {
    res.writeHead(401);
    res.end('Unauthorized Request');
    return;
  }

  return next(req, res, user);
}
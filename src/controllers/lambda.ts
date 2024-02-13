import BaseController from './base-controller';
import auth from '../server/auth';
import { IncomingMessage, ServerResponse } from 'http';
import { Request } from '../server';
import User from '../entity/user';
import { getRole } from '../db/role_service';
import {
  deleteLambda,
  getLambdaById,
  getLambdas,
  saveLambda,
} from '../db/lambda_service';
import Lambda from '../entity/lambda';

afterAll(() => {
  jest.resetModules();
});

interface LambdaRequest extends IncomingMessage {
  body: {
    id?: string;
    name: string;
    description: string;
    dockerfile: string;
    enabled: boolean;
  };
  params: { id: string };
}

export default class LambdaController extends BaseController {
  public async listLambdas(req: Request, res: ServerResponse, user: User | null) {
    if (!user) {
      res.writeHead(401);
      res.end('Unauthorized Request');
      return;
    }

    if (!user.role) {
      user.role = await getRole(user.role_id ?? '');
    }

    const lambdas = await getLambdas(
      user.role?.name === 'admin'
        ? ''
        : user.id,
    );

    res.writeHead(200);
    res.end(JSON.stringify(lambdas));
  }

  public async getLambda(req: Request, res: ServerResponse, user: User | null) {
    if (!user) {
      res.writeHead(401);
      res.end('Unauthorized Request');
      return;
    }

    const { id } = req.params as { id: string };
    if (!id) {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }

    if (!user.role) {
      user.role = await getRole(user.role_id ?? '');
    }

    const lambda = await getLambdaById(
      id,
      user.role?.name === 'admin'
        ? ''
        : user.id,
    );

    if (!lambda) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    res.writeHead(200);
    res.end(JSON.stringify(lambda));
  }

  public async createLambda(req: LambdaRequest, res: ServerResponse, user: User | null) {
    if (!user) {
      res.writeHead(401);
      res.end('Unauthorized Request');
      return;
    }

    const {
      id = req.params?.id ?? '',
      name,
      description,
      dockerfile,
      enabled,
    } = req?.body;

    if (!req?.body.name || !req?.body.description || !req?.body.dockerfile) {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }

    const lambda = id
      ? await getLambdaById(
        id,
        user?.role?.name === 'admin' ? '' : user.id,
      )
      : new Lambda(
        '',
        name,
        description,
        dockerfile,
        '',
        '',
        enabled,
        user.id,
        user,
      );

    if (!lambda) {
      res.writeHead(404);
      res.end(`lambda by id ${id} not found`);
      return;
    } else if (id && lambda.created_by !== user.id && user.role?.name !== 'admin') {
      res.writeHead(401);
      res.end('Unauthorized Request');
      return;
    } else if (id && lambda) {
      lambda.name = name;
      lambda.description = description;
      lambda.dockerfile = dockerfile;
      lambda.enabled = enabled;
    }

    const updatedLambda = await saveLambda(lambda);

    if (!updatedLambda) {
      res.writeHead(500);
      res.end('error saving lambda');
    }

    res.writeHead(200);
    res.end(JSON.stringify(lambda));
  }

  async deleteLambda(req: Request, res: ServerResponse, user: User | null) {
    if (!user) {
      res.writeHead(401);
      res.end('Unauthorized Request');
      return;
    }

    const { id } =  req.params as { id: string };

    if (!id) {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }

    const lambda = await getLambdaById(
      id,
      user?.role?.name === 'admin' ? '' : user.id,
    );

    if (!lambda) {
      res.writeHead(404);
      res.end(`lambda by id ${id} not found`);
      return;
    }

    await deleteLambda(id);

    res.writeHead(200);
    res.end(JSON.stringify({ result: true }));
  }

  public initRoutes() {
    this.server.get(
      '/lambdas',
      (req: IncomingMessage, res: ServerResponse) => auth(req, res, this.listLambdas),
    );

    this.server.get(
      '/lambdas/:id',
      (req: IncomingMessage, res: ServerResponse) => auth(req, res, this.getLambda),
    );

    this.server.post(
      '/lambdas',
      (req: IncomingMessage, res: ServerResponse) => auth(req, res, (rq, rs, user) => {
        return this.createLambda(rq as LambdaRequest, rs, user);
      }),
    );

    this.server.put(
      '/lambdas/:id',
      (req: IncomingMessage, res: ServerResponse) => auth(req, res, (rq, rs, user) => {
        return this.createLambda(rq as LambdaRequest, rs, user);
      }),
    );

    this.server.delete(
      '/lambdas/:id',
      (req: IncomingMessage, res: ServerResponse) => auth(req, res, this.deleteLambda),
    );
  }
}
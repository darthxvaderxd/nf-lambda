/* eslint-disable @typescript-eslint/no-explicit-any */
import LambdaController from './lambda';
import WebServer from '../server';
import User from '../entity/user';
import Role from '../entity/role';

jest.mock('../server');

const adminUser = {
  id: '10000000-0000-0000-0000-000000000001',
  username: 'admin',
  password: '',
  email: 'admin@localhost',
  role_id: '00000000-0000-0000-0000-000000000001',
  created_at: '2024-02-13T11:09:08.917Z',
  updated_at: '2024-02-13T11:09:08.917Z',
  role: {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'admin',
    description: 'admin',
    created_at: '2024-02-13T11:09:08.917Z',
    updated_at: '2024-02-13T11:09:08.917Z',
    enabled: true,
  } as Role,
};

// write jest unit tests for the lambda controller
describe('LambdaController', () => {
  // test that the listLambdas method returns the correct response
  describe('listLambdas', () => {
    test('listLambdas works', async () => {
      // create a new instance of the lambda controller
      const lambdaController = new LambdaController(new WebServer());
      // create a mock request
      const req = {
        body: {},
        params: {},
      };
      // create a mock response
      const res = {
        writeHead: jest.fn(),
        end: jest.fn(),
      };

      // call the listLambdas method with the mock request, response, and user
      await lambdaController.listLambdas(req as any, res as any, adminUser as User);

      // assert that the response was called with the correct status code and message
      expect(res.writeHead).toHaveBeenCalledWith(200);
    });

    // test that tests user is not authorized for listLambdas
    test('listLambdas fails without user', async () => {
      // create a new instance of the lambda controller
      const lambdaController = new LambdaController(new WebServer());
      // create a mock request
      const req = {
        body: {},
        params: {},
      };
      // create a mock response
      const res = {
        writeHead: jest.fn(),
        end: jest.fn(),
      };
      // create a mock user
      const user = null;
      // call the listLambdas method with the mock request, response, and user
      await lambdaController.listLambdas(req as any, res as any, user);

      // assert that the response was called with the correct status code and message
      expect(res.writeHead).toHaveBeenCalledWith(401);
      expect(res.end).toHaveBeenCalledWith('Unauthorized Request');
    });
  });

  test('lambda crud works as expected for add get update delete', async () => {
    const createdLambda = {
      name: 'test',
      description: 'description',
      dockerfile: 'dockerfile',
      enabled: true,
    };

    let endData = '';

    const lambdaController = new LambdaController(new WebServer());
    const req = {
      body: createdLambda,
      params: {},
    };
    const res = {
      writeHead: jest.fn(),
      end: (data: string) => {
        endData = data;
      },
    };

    await lambdaController.createLambda(req as any, res as any, adminUser as User);
    expect(res.writeHead).toHaveBeenCalledWith(200);
    expect(endData).toContain('id');

    const createdLambdaObject = JSON.parse(endData);
    expect(createdLambdaObject.id).toBeDefined();
    expect(createdLambdaObject.name).toBe(createdLambda.name);
    expect(createdLambdaObject.description).toBe(createdLambda.description);
    expect(createdLambdaObject.dockerfile).toBe(createdLambda.dockerfile);
    expect(createdLambdaObject.enabled).toBe(createdLambda.enabled);
    expect(createdLambdaObject.created_by).toBeDefined();
    expect(createdLambdaObject.created_at).toBeDefined();

    const updateLambdaRequest = {
      body: {
        ...createdLambdaObject,
        name: 'updated name',
        description: 'updated description',
      },
      params: { id: createdLambdaObject.id },
    };
    const updateRes = {
      writeHead: jest.fn(),
      end: (data: string) => {
        endData = data;
      },
    };

    await lambdaController.createLambda(updateLambdaRequest as any, updateRes as any, adminUser as User);
    expect(updateRes.writeHead).toHaveBeenCalledWith(200);
    expect(endData).toContain('updated name');
    expect(endData).toContain('updated description');

    const updatedLambdaObject = JSON.parse(endData);
    expect(updatedLambdaObject.id).toBe(createdLambdaObject.id);
    expect(updatedLambdaObject.name).toBe('updated name');
    expect(updatedLambdaObject.description).toBe('updated description');
    expect(updatedLambdaObject.dockerfile).toBe(createdLambda.dockerfile);
    expect(updatedLambdaObject.enabled).toBe(createdLambda.enabled);
    expect(updatedLambdaObject.created_by).toBe(createdLambdaObject.created_by);

    const deleteLambdaRequest = {
      body: {},
      params: { id: createdLambdaObject.id },
    };
    const deleteRes = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };

    await lambdaController.deleteLambda(deleteLambdaRequest as any, deleteRes as any, adminUser as User);
    expect(deleteRes.writeHead).toHaveBeenCalledWith(200);
    expect(deleteRes.end).toHaveBeenCalledWith('{"result":true}' );

    const getLambdaRequest = {
      body: {},
      params: { id: createdLambdaObject.id },
    };
    const getRes = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };

    await lambdaController.getLambda(getLambdaRequest as any, getRes as any, adminUser as User);
    expect(getRes.writeHead).toHaveBeenCalledWith(404);
  });

  test('getLambda fails without user', async () => {
    const lambdaController = new LambdaController(new WebServer());
    const req = {
      body: {},
      params: { id: 'test' },
    };
    const res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    await lambdaController.getLambda(req as any, res as any, null);
    expect(res.writeHead).toHaveBeenCalledWith(401);
    expect(res.end).toHaveBeenCalledWith('Unauthorized Request');
  });

  test('getLambda fails without id', async () => {
    const lambdaController = new LambdaController(new WebServer());
    const req = {
      body: {},
      params: {},
    };
    const res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    await lambdaController.getLambda(req as any, res as any, adminUser as User);
    expect(res.writeHead).toHaveBeenCalledWith(400);
    expect(res.end).toHaveBeenCalledWith('Bad Request');
  });

  test('updateLambda fails without user', async () => {
    const lambdaController = new LambdaController(new WebServer());
    const req = {
      body: {},
      params: { id: 'test' },
    };
    const res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };

    const user = null;
    await lambdaController.createLambda(req as any, res as any, user);
    expect(res.writeHead).toHaveBeenCalledWith(401);
    expect(res.end).toHaveBeenCalledWith('Unauthorized Request');
  });

  test('createLambda fails without body', async () => {
    const lambdaController = new LambdaController(new WebServer());
    const req = {
      body: {},
      params: {},
    };
    const res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    await lambdaController.createLambda(req as any, res as any, adminUser as User);
    expect(res.writeHead).toHaveBeenCalledWith(400);
    expect(res.end).toHaveBeenCalledWith('Bad Request');
  });

  test('deleteLambda fails without user', async () => {
    const lambdaController = new LambdaController(new WebServer());
    const req = {
      body: {},
      params: { id: 'test' },
    };
    const res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    await lambdaController.deleteLambda(req as any, res as any, null);
    expect(res.writeHead).toHaveBeenCalledWith(401);
    expect(res.end).toHaveBeenCalledWith('Unauthorized Request');
  });

  test('deleteLambda fails without id', async () => {
    const lambdaController = new LambdaController(new WebServer());
    const req = {
      body: {},
      params: {},
    };
    const res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    await lambdaController.deleteLambda(req as any, res as any, adminUser as User);
    expect(res.writeHead).toHaveBeenCalledWith(400);
    expect(res.end).toHaveBeenCalledWith('Bad Request');
  });

  test('getLambda throws 404 if invalid id', async () => {
    const lambdaController = new LambdaController(new WebServer());
    const req = {
      body: {},
      params: { id: '00000000-0000-0000-0000-000000000001' },
    };
    const res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    await lambdaController.getLambda(req as any, res as any, adminUser as User);
    expect(res.writeHead).toHaveBeenCalledWith(404);
    expect(res.end).toHaveBeenCalledWith('Not Found');
  });

  test('deleteLambda throws 404 if invalid id', async () => {
    const lambdaController = new LambdaController(new WebServer());
    const req = {
      body: {},
      params: { id: '00000000-0000-0000-0000-000000000001' },
    };
    const res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    await lambdaController.deleteLambda(req as any, res as any, adminUser as User);
    expect(res.writeHead).toHaveBeenCalledWith(404);
    expect(res.end).toHaveBeenCalledWith('lambda by id 00000000-0000-0000-0000-000000000001 not found');
  });
});
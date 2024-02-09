import Lambda from './lambda';

export default class LambdaExecution {
  id: string;

  lambda_id: string;

  lambda: Lambda | undefined;

  created_at: string;

  updated_at: string;

  enabled: boolean;

  result: string;

  status: string;

  constructor(
    id: string,
    lambda_id: string,
    lambda: Lambda | undefined,
    created_at: string,
    updated_at: string,
    enabled: boolean,
    result: string,
    status: string = '',
  ) {
    this.id = id;
    this.lambda_id = lambda_id;
    this.lambda = lambda;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.enabled = enabled;
    this.result = result;
    this.status = status;
  }
}
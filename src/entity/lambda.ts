import User from './user';

export default class Lambda {
  id: string;

  name: string;

  description: string;

  dockerfile: string;

  created_at: string;

  updated_at: string;

  enabled: boolean;

  created_by: string;

  user: User | undefined;

  constructor(
    id: string,
    name: string,
    description: string,
    dockerfile: string,
    created_at: string,
    updated_at: string,
    enabled: boolean,
    created_by: string,
    user: User | undefined = undefined,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.dockerfile = dockerfile;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.enabled = enabled;
    this.created_by = created_by;
    this.user = user;
  }
}
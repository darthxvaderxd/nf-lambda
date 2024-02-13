import { hash } from '../db/hash';
import Role from './role';

export default class User {
  id: string = '';

  username: string;

  password: string;

  email: string;

  role_id: string;

  role: Role | null;

  created_at: string;

  updated_at: string;

  enabled: boolean;

  constructor(
    username: string,
    password: string,
    email: string,
    role_id: string,
    role: Role | undefined,
    created_at: string,
    updated_at: string,
    enabled: boolean,
  ) {
    this.username = username;
    this.password = password;
    this.email = email;
    this.role_id = role_id;
    this.role = role || null;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.enabled = enabled;
  }

  setPassword(password: string) {
    this.password = hash(password);
  }
}
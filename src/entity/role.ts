export default class Role {
  id: string;

  name: string;

  created_at: string;

  updated_at: string;

  enabled: boolean;

  constructor(
    id: string,
    name: string,
    created_at: string,
    updated_at: string,
    enabled: boolean,
  ) {
    this.id = id;
    this.name = name;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.enabled = enabled;
  }
}
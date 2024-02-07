import crypto from 'crypto';

function generateKey(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function hash(data: string): string {
  const key = generateKey();
  const hmac = crypto.createHmac('sha512', key);
  hmac.update(data);
  return `${hmac.digest('hex')}.${key}`;
}

export function compare(data: string, hash: string): boolean {
  const [hashValue, key] = hash.split('.');
  const hmac = crypto.createHmac('sha512', key);
  hmac.update(data);
  return hmac.digest('hex') === hashValue;
}
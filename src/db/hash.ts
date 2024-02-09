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

export function verify(data: string, encrypted: string): boolean {
  const [hashValue, key] = encrypted.split('.');
  const hmac = crypto.createHmac('sha512', key);
  hmac.update(data);
  return hmac.digest('hex') === hashValue;
}
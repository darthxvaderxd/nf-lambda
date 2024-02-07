import { hash, verify } from './hash';

describe('hash', () => {
  test('should hash the data', () => {
    const data = 'hello world';
    const hashed = hash(data);
    expect(hashed).not.toBe(data);
  });

  test('two hashes of the same data should be different', () => {
    const data = 'hello world';
    const hashed1 = hash(data);
    const hashed2 = hash(data);
    expect(hashed1).not.toBe(hashed2);
  });

    test('should be able to verify the data with the hash', () => {
        const data = 'hello world';
        const hashed = hash(data);
        expect(verify(data, hashed)).toBe(true);
    });

    test('should return false if the data does not match the hash', () => {
        const data = 'hello world';
        const hashed = hash(data);
        expect(verify('hello world!', hashed)).toBe(false);
    });
});
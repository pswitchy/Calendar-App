import { randomBytes, pbkdf2 } from 'crypto';
import { promisify } from 'util';

const pbkdf2Async = promisify(pbkdf2);

const ITERATIONS = 100000;
const KEYLEN = 64;
const DIGEST = 'sha512';

export async function hashPassword(password: string) {
  const salt = randomBytes(32).toString('hex');
  const hash = await pbkdf2Async(
    password,
    salt,
    ITERATIONS,
    KEYLEN,
    DIGEST
  );
  return {
    hash: hash.toString('hex'),
    salt
  };
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
) {
  const hash = await pbkdf2Async(
    password,
    storedSalt,
    ITERATIONS,
    KEYLEN,
    DIGEST
  );
  return hash.toString('hex') === storedHash;
}
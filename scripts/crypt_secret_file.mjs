import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function parseArgs(argv) {
  const args = {
    mode: '',
    input: '',
    output: '',
    passphraseEnv: ''
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === 'encrypt' || arg === 'decrypt') args.mode = arg;
    else if (arg === '--input') args.input = argv[++index] || '';
    else if (arg === '--output') args.output = argv[++index] || '';
    else if (arg === '--passphrase-env') args.passphraseEnv = argv[++index] || '';
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage:
  node scripts/crypt_secret_file.mjs encrypt --input path --output path.enc --passphrase-env ENV_NAME
  node scripts/crypt_secret_file.mjs decrypt --input path.enc --output path --passphrase-env ENV_NAME

Purpose:
  Encrypt or decrypt a sensitive deployment file using AES-256-GCM. Commit only
  the encrypted output. Keep the passphrase in a local ignored file or GitHub
  Actions secret; never print it or commit the plaintext input.
`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!['encrypt', 'decrypt'].includes(args.mode)) throw new Error('mode must be encrypt or decrypt');
  if (!args.input) throw new Error('--input is required');
  if (!args.output) throw new Error('--output is required');
  if (!args.passphraseEnv) throw new Error('--passphrase-env is required');
  return args;
}

function getPassphrase(envName) {
  const passphrase = process.env[envName];
  if (!passphrase) throw new Error(`missing passphrase environment variable: ${envName}`);
  return passphrase;
}

function deriveKey(passphrase, salt) {
  return crypto.scryptSync(passphrase, salt, 32);
}

async function encryptFile({ input, output, passphrase }) {
  const plaintext = await fs.readFile(input);
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = deriveKey(passphrase, salt);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const payload = {
    version: 1,
    algorithm: 'aes-256-gcm+scrypt',
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64')
  };
  await fs.mkdir(path.dirname(path.resolve(output)), { recursive: true });
  await fs.writeFile(output, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

async function decryptFile({ input, output, passphrase }) {
  const payload = JSON.parse(await fs.readFile(input, 'utf8'));
  if (payload.version !== 1 || payload.algorithm !== 'aes-256-gcm+scrypt') {
    throw new Error('unsupported encrypted secret file format');
  }
  const salt = Buffer.from(payload.salt, 'base64');
  const iv = Buffer.from(payload.iv, 'base64');
  const tag = Buffer.from(payload.tag, 'base64');
  const ciphertext = Buffer.from(payload.ciphertext, 'base64');
  const key = deriveKey(passphrase, salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  await fs.mkdir(path.dirname(path.resolve(output)), { recursive: true });
  await fs.writeFile(output, plaintext);
}

const args = parseArgs(process.argv.slice(2));
const passphrase = getPassphrase(args.passphraseEnv);
if (args.mode === 'encrypt') {
  await encryptFile({ input: args.input, output: args.output, passphrase });
} else {
  await decryptFile({ input: args.input, output: args.output, passphrase });
}

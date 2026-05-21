import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

function getMasterKey(): Buffer {
  const masterKeyHex = process.env.ENCRYPTION_MASTER_KEY;
  if (!masterKeyHex || masterKeyHex.length !== 64) {
    throw new Error('ENCRYPTION_MASTER_KEY must be a 64-character hex string (32 bytes)');
  }
  return Buffer.from(masterKeyHex, 'hex');
}

/**
 * Generate a random file encryption key
 */
export function generateFileKey(): Buffer {
  return crypto.randomBytes(KEY_LENGTH);
}

/**
 * Encrypt the file key with the master key
 */
export function encryptFileKey(fileKey: Buffer): { encryptedKey: string; iv: string; tag: string } {
  const masterKey = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv);
  
  const encrypted = Buffer.concat([cipher.update(fileKey), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  return {
    encryptedKey: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypt the file key using the master key
 */
export function decryptFileKey(encryptedKeyHex: string, ivHex: string, tagHex: string): Buffer {
  const masterKey = getMasterKey();
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedKeyHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv);
  decipher.setAuthTag(tag);
  
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Encrypt file data with the file key
 * Returns encrypted buffer, IV, and auth tag
 */
export function encryptFile(data: Buffer, fileKey: Buffer): { encrypted: Buffer; iv: string; tag: string } {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, fileKey, iv);
  
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypt file data with the file key
 */
export function decryptFile(encryptedData: Buffer, fileKey: Buffer, ivHex: string, tagHex: string): Buffer {
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, fileKey, iv);
  decipher.setAuthTag(tag);
  
  return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
}

/**
 * Encrypt and store a file with two-layer encryption
 * 1. File is encrypted with a unique file key (AES-256-GCM)
 * 2. File key is encrypted with master key (AES-256-GCM)
 */
export function encryptFileForStorage(data: Buffer): {
  encryptedData: Buffer;
  encryptionIV: string;
  encryptionTag: string;
  encryptedFileKey: string;
  fileKeyIV: string;
  fileKeyTag: string;
} {
  // Generate unique file key
  const fileKey = generateFileKey();
  
  // Encrypt file with file key
  const { encrypted: encryptedData, iv: encryptionIV, tag: encryptionTag } = encryptFile(data, fileKey);
  
  // Encrypt file key with master key
  const { encryptedKey: encryptedFileKey, iv: fileKeyIV, tag: fileKeyTag } = encryptFileKey(fileKey);
  
  return {
    encryptedData,
    encryptionIV,
    encryptionTag,
    encryptedFileKey: `${encryptedFileKey}:${fileKeyIV}:${fileKeyTag}`,
    fileKeyIV,
    fileKeyTag,
  };
}

/**
 * Decrypt a stored file (reverses two-layer encryption)
 */
export function decryptFileFromStorage(
  encryptedData: Buffer,
  encryptionIV: string,
  encryptionTag: string,
  encryptedFileKeyStr: string
): Buffer {
  // Parse the encrypted file key components
  const [encryptedKeyHex, keyIV, keyTag] = encryptedFileKeyStr.split(':');
  
  // Decrypt file key with master key
  const fileKey = decryptFileKey(encryptedKeyHex, keyIV, keyTag);
  
  // Decrypt file with file key
  return decryptFile(encryptedData, fileKey, encryptionIV, encryptionTag);
}

/**
 * Hash sensitive text (for searching encrypted data)
 */
export function hashText(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

import CryptoJS from "crypto-js";

export interface DerivedKeyMaterial {
  key: CryptoJS.lib.WordArray;
}

export function deriveKeyFromPassword(password: string, saltBase64: string): DerivedKeyMaterial {
  const salt = CryptoJS.enc.Base64.parse(saltBase64);
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 200000,
    hasher: CryptoJS.algo.SHA256,
  });
  return { key };
}

export function encryptJson(payload: unknown, key: CryptoJS.lib.WordArray) {
  const iv = CryptoJS.lib.WordArray.random(16);
  const plaintext = JSON.stringify(payload);
  const ciphertext = CryptoJS.AES.encrypt(plaintext, key, { iv }).ciphertext;
  return {
    ciphertextBase64: CryptoJS.enc.Base64.stringify(ciphertext),
    ivBase64: CryptoJS.enc.Base64.stringify(iv),
  };
}

export function decryptJson<T>(ciphertextBase64: string, ivBase64: string, key: CryptoJS.lib.WordArray): T {
  const ciphertext = CryptoJS.enc.Base64.parse(ciphertextBase64);
  const iv = CryptoJS.enc.Base64.parse(ivBase64);
  const decrypted = CryptoJS.AES.decrypt({ ciphertext } as unknown as CryptoJS.lib.CipherParams, key, { iv });
  const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
  return JSON.parse(plaintext) as T;
}


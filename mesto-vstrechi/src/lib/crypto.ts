const enc = new TextEncoder();
const dec = new TextDecoder();
const KEYS_KEY = "mv_ecdh_keys_v2";

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function createFallbackKey(seed: string): Promise<CryptoKey> {
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(`mesto-vstrechi-${seed}`));

  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export async function getKeyPair(): Promise<CryptoKeyPair | null> {
  if (!globalThis.crypto?.subtle) {
    return null;
  }

  const stored = localStorage.getItem(KEYS_KEY);

  if (stored) {
    const parsed = JSON.parse(stored) as { publicKey: JsonWebKey; privateKey: JsonWebKey };
    const publicKey = await crypto.subtle.importKey("jwk", parsed.publicKey, { name: "ECDH", namedCurve: "P-256" }, true, []);
    const privateKey = await crypto.subtle.importKey("jwk", parsed.privateKey, { name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey"]);

    return { publicKey, privateKey };
  }

  const pair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey"]);
  const exported = {
    publicKey: await crypto.subtle.exportKey("jwk", pair.publicKey),
    privateKey: await crypto.subtle.exportKey("jwk", pair.privateKey)
  };

  localStorage.setItem(KEYS_KEY, JSON.stringify(exported));
  return pair;
}

export async function getPublicKey(): Promise<JsonWebKey | undefined> {
  const pair = await getKeyPair().catch(() => null);

  if (!pair) {
    return undefined;
  }

  return crypto.subtle.exportKey("jwk", pair.publicKey);
}

export async function deriveSharedKey(theirPublicKey: JsonWebKey, peerId: string): Promise<CryptoKey> {
  const pair = await getKeyPair().catch(() => null);

  if (!pair) {
    return createFallbackKey(peerId);
  }

  const publicKey = await crypto.subtle.importKey("jwk", theirPublicKey, { name: "ECDH", namedCurve: "P-256" }, true, []);

  return crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey },
    pair.privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptText(text: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: toArrayBuffer(iv) }, key, toArrayBuffer(enc.encode(text)));
  const payload = new Uint8Array(iv.byteLength + encrypted.byteLength);

  payload.set(iv, 0);
  payload.set(new Uint8Array(encrypted), iv.byteLength);
  return bytesToBase64(payload);
}

export async function decryptText(payloadBase64: string, key: CryptoKey): Promise<string> {
  const payload = base64ToBytes(payloadBase64);
  const iv = payload.slice(0, 12);
  const data = payload.slice(12);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: toArrayBuffer(iv) }, key, toArrayBuffer(data));

  return dec.decode(plain);
}

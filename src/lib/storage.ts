import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface FlowPilotDB extends DBSchema {
  settings: {
    key: string;
    value: {
      key: string;
      value: string;
      encrypted?: boolean;
    };
  };
  flows: {
    key: string;
    value: {
      id: string;
      name: string;
      nodes: any[];
      edges: any[];
      createdAt: number;
      updatedAt: number;
    };
  };
}

let db: IDBPDatabase<FlowPilotDB>;

export const initDB = async () => {
  db = await openDB<FlowPilotDB>('flowpilot', 1, {
    upgrade(db) {
      db.createObjectStore('settings', { keyPath: 'key' });
      db.createObjectStore('flows', { keyPath: 'id' });
    },
  });
  return db;
};

export const getDB = async () => {
  if (!db) {
    await initDB();
  }
  return db;
};

// Simple encryption helpers (client-side only, for basic protection)
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const hashKey = async (key: string): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('flowpilot-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

export const encryptValue = async (value: string): Promise<string> => {
  const key = await hashKey('flowpilot-encryption-key');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(value)
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
};

export const decryptValue = async (encrypted: string): Promise<string> => {
  const key = await hashKey('flowpilot-encryption-key');
  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  return decoder.decode(decrypted);
};

// Settings operations
export const saveSetting = async (key: string, value: string, encrypted = false) => {
  const database = await getDB();
  const finalValue = encrypted ? await encryptValue(value) : value;
  await database.put('settings', { key, value: finalValue, encrypted });
};

export const getSetting = async (key: string): Promise<string | null> => {
  const database = await getDB();
  const setting = await database.get('settings', key);
  if (!setting) return null;
  return setting.encrypted ? await decryptValue(setting.value) : setting.value;
};

export const deleteSetting = async (key: string) => {
  const database = await getDB();
  await database.delete('settings', key);
};

// Flow operations
export const saveFlow = async (flow: {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
}) => {
  const database = await getDB();
  const existing = await database.get('flows', flow.id);
  await database.put('flows', {
    ...flow,
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
  });
};

export const getFlow = async (id: string) => {
  const database = await getDB();
  return database.get('flows', id);
};

export const getAllFlows = async () => {
  const database = await getDB();
  return database.getAll('flows');
};

export const deleteFlow = async (id: string) => {
  const database = await getDB();
  await database.delete('flows', id);
};

export const clearAllData = async () => {
  const database = await getDB();
  await database.clear('settings');
  await database.clear('flows');
};

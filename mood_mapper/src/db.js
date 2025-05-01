import { openDB } from 'idb';

const dbName = 'mood_mapper';
const storeName = 'journeys';
const version = 1;

const initDB = async () => {
  const db = await openDB(dbName, version, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        store.createIndex('title', 'title', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }
    },
  });
  return db;
};

export const addJourney = async (journey) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  const id = await store.add({
    ...journey,
    date: new Date().toISOString(),
  });
  await tx.done;
  return id;
};

export const updateJourney = async (id, journey) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.put({
    ...journey,
    id,
    date: new Date().toISOString(),
  });
  await tx.done;
};

export const deleteJourney = async (id) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.delete(id);
  await tx.done;
};

export const getAllJourneys = async () => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const journeys = await store.getAll();
  await tx.done;
  return journeys;
};

export const getJourney = async (id) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const journey = await store.get(id);
  await tx.done;
  return journey;
}; 
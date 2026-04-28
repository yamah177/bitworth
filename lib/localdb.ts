const DB_NAME = 'satsworth_guest'
const DB_VERSION = 1

const STORES = {
  accounts: 'accounts',
  liabilities: 'liabilities',
  snapshots: 'snapshots',
  prefs: 'prefs',
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORES.accounts)) db.createObjectStore(STORES.accounts, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(STORES.liabilities)) db.createObjectStore(STORES.liabilities, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(STORES.snapshots)) {
        const ss = db.createObjectStore(STORES.snapshots, { keyPath: 'id' })
        ss.createIndex('created_at', 'created_at', { unique: false })
      }
      if (!db.objectStoreNames.contains(STORES.prefs)) db.createObjectStore(STORES.prefs, { keyPath: 'key' })
    }
  })
}

function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function promisify<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function getAll<T>(db: IDBDatabase, store: string): Promise<T[]> {
  return promisify(db.transaction(store, 'readonly').objectStore(store).getAll())
}

export async function localGetAccounts() {
  const db = await openDB()
  const items = await getAll<any>(db, STORES.accounts)
  return items.sort((a, b) => b.usd_value - a.usd_value)
}

export async function localAddAccount(data: any) {
  const db = await openDB()
  const account = { id: generateId(), user_id: 'guest', is_manual: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), institution: null, notes: null, ...data }
  await promisify(db.transaction(STORES.accounts, 'readwrite').objectStore(STORES.accounts).put(account))
  return account
}

export async function localUpdateAccount(id: string, data: any) {
  const db = await openDB()
  const store = db.transaction(STORES.accounts, 'readwrite').objectStore(STORES.accounts)
  const existing = await promisify<any>(store.get(id))
  const updated = { ...existing, ...data, updated_at: new Date().toISOString() }
  const db2 = await openDB()
  await promisify(db2.transaction(STORES.accounts, 'readwrite').objectStore(STORES.accounts).put(updated))
  return updated
}

export async function localDeleteAccount(id: string) {
  const db = await openDB()
  await promisify(db.transaction(STORES.accounts, 'readwrite').objectStore(STORES.accounts).delete(id))
}

export async function localGetLiabilities() {
  const db = await openDB()
  const items = await getAll<any>(db, STORES.liabilities)
  return items.sort((a, b) => b.usd_balance - a.usd_balance)
}

export async function localAddLiability(data: any) {
  const db = await openDB()
  const liability = { id: generateId(), user_id: 'guest', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), institution: null, notes: null, ...data }
  await promisify(db.transaction(STORES.liabilities, 'readwrite').objectStore(STORES.liabilities).put(liability))
  return liability
}

export async function localUpdateLiability(id: string, data: any) {
  const db = await openDB()
  const store = db.transaction(STORES.liabilities, 'readwrite').objectStore(STORES.liabilities)
  const existing = await promisify<any>(store.get(id))
  const updated = { ...existing, ...data, updated_at: new Date().toISOString() }
  const db2 = await openDB()
  await promisify(db2.transaction(STORES.liabilities, 'readwrite').objectStore(STORES.liabilities).put(updated))
  return updated
}

export async function localDeleteLiability(id: string) {
  const db = await openDB()
  await promisify(db.transaction(STORES.liabilities, 'readwrite').objectStore(STORES.liabilities).delete(id))
}

export async function localGetSnapshots(days = 365) {
  const db = await openDB()
  const all = await getAll<any>(db, STORES.snapshots)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return all
    .filter(s => new Date(s.created_at) >= cutoff)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

export async function localAddSnapshot(data: any) {
  const db = await openDB()
  const snapshot = { id: generateId(), user_id: 'guest', created_at: new Date().toISOString(), ...data }
  await promisify(db.transaction(STORES.snapshots, 'readwrite').objectStore(STORES.snapshots).put(snapshot))
  return snapshot
}

export async function localGetPref(key: string) {
  const db = await openDB()
  const result = await promisify<any>(db.transaction(STORES.prefs, 'readonly').objectStore(STORES.prefs).get(key))
  return result?.value ?? null
}

export async function localSetPref(key: string, value: string) {
  const db = await openDB()
  await promisify(db.transaction(STORES.prefs, 'readwrite').objectStore(STORES.prefs).put({ key, value }))
}

export async function exportLocalData() {
  const db = await openDB()
  const [accounts, liabilities, snapshots] = await Promise.all([
    getAll<any>(db, STORES.accounts),
    getAll<any>(db, STORES.liabilities),
    getAll<any>(db, STORES.snapshots),
  ])
  return { accounts, liabilities, snapshots }
}

export async function clearLocalData() {
  const db = await openDB()
  await Promise.all([
    promisify(db.transaction(STORES.accounts, 'readwrite').objectStore(STORES.accounts).clear()),
    promisify(db.transaction(STORES.liabilities, 'readwrite').objectStore(STORES.liabilities).clear()),
    promisify(db.transaction(STORES.snapshots, 'readwrite').objectStore(STORES.snapshots).clear()),
    promisify(db.transaction(STORES.prefs, 'readwrite').objectStore(STORES.prefs).clear()),
  ])
}

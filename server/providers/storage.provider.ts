export interface IStorageProvider {
  save(key: string, data: Buffer | string, contentType: string): Promise<string>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<boolean>;
}

export class MemoryStorageProvider implements IStorageProvider {
  private store: Map<string, { data: Buffer; contentType: string }> = new Map();

  async save(key: string, data: Buffer | string, contentType: string): Promise<string> {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8');
    this.store.set(key, { data: buffer, contentType });
    return `/storage/${encodeURIComponent(key)}`;
  }

  async get(key: string): Promise<Buffer | null> {
    const item = this.store.get(key);
    return item ? item.data : null;
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }
}

export const defaultStorageProvider = new MemoryStorageProvider();

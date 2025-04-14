interface Window {
  matchMedia(query: string): MediaQueryList;
  document: Document;
  localStorage: Storage;
  innerWidth: number;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

declare var global: {
  _mongoClientPromise?: Promise<import('mongodb').MongoClient>;
}; 
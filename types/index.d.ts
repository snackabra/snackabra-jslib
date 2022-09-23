interface GenericObject {
  [key]: any
}

interface SnackabraOptions {
  channel_server: null | string,
  channel_ws: null | string,
  storage_server: null | string,
}

interface SnackabraKeys {
  exportable_pubKey: string,
  exportable_privateKey: string,
  privateKey: string,
}

interface IndexedKVOptions {
  db: string,
  table: string,
  onReady: null | function,
}

interface FileSystemDBOptions {
  db: string,
  table: string,
  onReady: null | function,
}

type StorableDataType = string | number | bigint | boolean | symbol | object

interface Dictionary {
  [index: string]: any;
}

interface ChannelData {
  roomId?: string;
  channelId?: string;
  ownerKey: string;
  encryptionKey: string;
  signKey: string;
  SERVER_SECRET: string;
}

/******************************************************************************************************/
/**
 * Interfaces
 */
/**
 * SBChannelHandle
 *
 * Complete descriptor of a channel. 'key' is stringified 'jwk' key.
 * The key is always private. If it matches the channelId, then it's
 * an 'owner' key.
 */
export interface SBChannelHandle {
    channelId: SBChannelId;
    key: JsonWebKey;
}
export interface SBServer {
    channel_server: string;
    channel_ws: string;
    storage_server: string;
    shard_server?: string;
}
interface Dictionary<T> {
    [index: string]: T;
}
export type SBChannelId = string;
interface ChannelData {
    roomId?: SBChannelId;
    channelId?: SBChannelId;
    ownerKey: string;
    encryptionKey: string;
    signKey: string;
    SERVER_SECRET: string;
}
interface ImageMetaData {
    imageId?: string;
    previewId?: string;
    imageKey?: string;
    previewKey?: string;
    previewNonce?: string;
    previewSalt?: string;
}
/**
@typedef {import("./snackabra.d.ts").ChannelMessage} ChannelMessage
*/
/**
   for example the incoming message will look like this (after decryption)

  { encrypted":false,
   "contents":"Hello from test04d!",
   "sign":"u7zAM-1fNLZjmuayOkwWvXTBGqMEimOuzp1DJGX4ECg",
   "image":"",
   "imageMetaData":{},
   "sender_pubKey":{"crv":"P-384","ext":true,"key_ops":[],"kty":"EC","x":"edqHd4aUn7dGsuDMQxtvzuw-Q2N7l77HBW81KvWj9qtzU7ab-sFHUBqogg2PKihj","y":"Oqp27bXL4RUcAHpWUEFHZdyEuhTo8_8oyTsAKJDk1g_NQOA0FR5Sy_8ViTTWS9wT"},
   "sender_username":"TestBot",
   "image_sign":"3O0AYKthtWWYUX3AWDmdU4kTR49UyNyaA937CfKtcQw",
   "imageMetadata_sign":"4LmewpsH6TcRhHYQLivd4Ce87SI1AJIaezhJB5sdD7M"
  }
  */
export interface ChannelMessage {
    type?: ChannelMessageTypes;
    keys?: ChannelKeyStrings;
    _id?: string;
    id?: string;
    timestamp?: number;
    timestampPrefix?: string;
    channelID?: SBChannelId;
    control?: boolean;
    encrypted_contents?: EncryptedContents;
    contents?: string;
    text?: string;
    sign?: string;
    image?: string;
    image_sign?: string;
    imageMetaData?: ImageMetaData;
    imageMetadata_sign?: string;
    motd?: string;
    ready?: boolean;
    roomLocked?: boolean;
    sender_pubKey?: JsonWebKey;
    sender_username?: string;
    system?: boolean;
    user?: {
        name: string;
        _id?: JsonWebKey;
    };
    verificationToken?: string;
}
/** sample channelKeys contents
 *
 * ::
 *
 * { "ready": true,
 *    "keys": {
 *            "ownerKey": "{\"crv\":\"P-384\",\"ext\":true,\"key_ops\":[],\"kty\":\"EC\",
 *                        \"x\":\"9s17B4i0Cuf_w9XN_uAq2DFePOr6S3sMFMA95KjLN8akBUWEhPAcuMEMwNUlrrkN\",
 *                        \"y\":\"6dAtcyMbtsO5ufKvlhxRsvjTmkABGlTYG1BrEjTpwrAgtmn6k25GR7akklz9klBr\"}",
 *            "guestKey": "{\"crv\":\"P-384\",\"ext\":true,\"key_ops\":[],\"kty\":\"EC\",
 *                         \"x\":\"Lx0eJcbNuyEfHDobWaZqgy9UO7ppxVIsEpEtvbzkAlIjySh9lY2AvgnACREO6QXD\",
 *                         \"y\":\"zEHPgpsl4jge_Q-K6ekuzi2bQOybnaPT1MozCFQJnXEePBX8emkHriOiwl6P8BAS\"}",
 *            "encryptionKey": "{\"alg\":\"A256GCM\",\"ext\":true,
 *                             \"k\":\"F0sQTTLXDhuvvmgGQLzMoeHPD-SJlFyhfOD-cqejEOU\",
 *                             \"key_ops\":[\"encrypt\",\"decrypt\"],\"kty\":\"oct\"}",
 *            "signKey": "{\"crv\":\"P-384\",
 *                        \"d\":\"KCJHDZ34XgVFsS9-sU09HFzXZhnGCvnDgJ5a8GTSfjuJQaq-1N2acvchPRhknk8B\",
 *                        \"ext\":true,\"key_ops\":[\"deriveKey\"],\"kty\":\"EC\",
 *                        \"x\":\"rdsyBle0DD1hvp2OE2mINyyI87Cyg7FS3tCQUIeVkfPiNOACtFxi6iP8oeYt-Dge\",
 *                        \"y\":\"qW9VP72uf9rgUU117G7AfTkCMncJbT5scIaIRwBXfqET6FYcq20fwSP7R911J2_t\"}"
 *             },
 * "motd": "",
 * "roomLocked": false}
 */
interface ChannelKeyStrings {
    encryptionKey: string;
    guestKey?: string;
    ownerKey: string;
    signKey: string;
    lockedKey?: string;
}
export interface ChannelKeys {
    ownerKey: CryptoKey;
    guestKey?: CryptoKey;
    encryptionKey: CryptoKey;
    signKey: CryptoKey;
    lockedKey?: CryptoKey;
    channelSignKey: CryptoKey;
    privateKey: CryptoKey;
}
/** Encryptedcontents

    SB standard wrapping encrypted messages.

    Encryption is done with AES-GCM, 16 bytes of salt, The
    ``contents`` are url-safe base64, same thing with the nonce (iv),
    depending on if it's internal or over wire.
 */
export interface EncryptedContents {
    content: string | ArrayBuffer;
    iv: string | Uint8Array;
}
/**
 * Same as EncryptedContents interface, but binary view enforced
 */
export interface EncryptedContentsBin {
    content: ArrayBuffer;
    iv: Uint8Array;
}
/**
 * Force EncryptedContents object to binary (interface
 * supports either string or arrays). String contents
 * implies base64 encoding.
 */
export declare function encryptedContentsMakeBinary(o: EncryptedContents): EncryptedContentsBin;
export type ChannelMessageTypes = 'ack' | 'keys' | 'invalid' | 'ready' | 'encypted';
/******************************************************************************************************/
/**
 * SB simple events (mesage bus) class
 */
export declare class MessageBus {
    #private;
    bus: Dictionary<any>;
    /**
     * Subscribe. 'event' is a string, special case '*' means everything
     *  (in which case the handler is also given the message)
     */
    subscribe(event: string, handler: CallableFunction): void;
    /**
     * Unsubscribe
     */
    unsubscribe(event: string, handler: CallableFunction): void;
    /**
     * Publish
     */
    publish(event: string, ...args: unknown[]): void;
}
export declare function _sb_exception(loc: string, msg: string): void;
export declare function _sb_resolve(val: any): any;
export declare function _sb_assert(val: unknown, msg: string): void;
/******************************************************************************************************/
/******************************************************************************************************/
/**
 * Fills buffer with random data
 */
export declare function getRandomValues(buffer: Uint8Array): Uint8Array;
/**
 * Returns 'true' if (and only if) string is well-formed base64.
 * Works same on browsers and nodejs.
 */
export declare function _assertBase64(base64: string): boolean;
/**
 * Standardized 'atob()' function, e.g. takes the a Base64 encoded
 * input and decodes it. Note: always returns Uint8Array.
 * Accepts both regular Base64 and the URL-friendly variant,
 * where `+` => `-`, `/` => `_`, and the padding character is omitted.
 *
 * @param {str} base64 string in either regular or URL-friendly representation.
 * @return {Uint8Array} returns decoded binary result
 */
export declare function base64ToArrayBuffer(str: string): Uint8Array;
/**
 * Compare buffers
 */
export declare function compareBuffers(a: Uint8Array | ArrayBuffer | null, b: Uint8Array | ArrayBuffer | null): boolean;
/**
 * Standardized 'btoa()'-like function, e.g., takes a binary string
 * ('b') and returns a Base64 encoded version ('a' used to be short
 * for 'ascii').
 *
 * @param {bufferSource} ArrayBuffer buffer
 * @return {string} base64 string
 */
export declare function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array | null, variant?: 'b64' | 'url'): string;
/**
 * Appends two buffers and returns a new buffer
 *
 * @param buffer1
 * @param buffer2
 * @returns
 */
export declare function _appendBuffer(buffer1: Uint8Array | ArrayBuffer, buffer2: Uint8Array | ArrayBuffer): ArrayBuffer;
/**
 * Returns random number
 *
 * @return {int} integer 0..255
 *
 */
export declare function simpleRand256(): number;
/**
 * Returns a random string in requested encoding
 *
 * @param {n} number of characters
 * @param {code} encoding, supported types: 'base32mi'
 * @return {string} random string
 *
 * base32mi: ``0123456789abcdefyhEjkLmNHpFrRTUW``
 */
export declare function simpleRandomString(n: number, code: string): string;
/**
 * Disambiguates strings that are known to be 'base32mi' type
 *
 * ::
 *
 *     'base32mi': '0123456789abcdefyhEjkLmNHpFrRTUW'
 *
 * This is the base32mi disambiguation table
 *
 *  ::
 *
 *     [OoQD] -> '0'
 *     [lIiJ] -> '1'
 *     [Zz] -> '2'
 *     [A] -> '4'
 *     [Ss] -> '5'
 *     [G] -> '6'
 *     [t] -> '7'
 *     [B] -> '8'
 *     [gq] -> '9'
 *     [C] -> 'c'
 *     [Y] -> 'y'
 *     [KxX] -> 'k'
 *     [M] -> 'm'
 *     [n] -> 'N'
 *     [P] -> 'p'
 *     [uvV] -> 'U'
 *     [w] -> 'W'
 *
 * Another way to think of it is this transform ('.' means no change):
 *
 * ::
 *
 *     0123456789abcdefghijklmnopqrstuvxyzABCDEFGHIJKLMNOPQRSTUVXYZ
 *     ................9.1..1.N0.9.57UUk.248c0EF6.11kLm.0p0.5..Uky2
 *
 */
export declare function cleanBase32mi(s: string): string;
/**
 * Partition
 */
export declare function partition(str: string, n: number): void;
/**
 * There are many problems with JSON parsing, adding a wrapper to capture more info.
 * The 'loc' parameter should be a (unique) string that allows you to find the usage
 * in the code; one approach is the line number in the file (at some point).
 */
export declare function jsonParseWrapper(str: string, loc: string): any;
export interface SBPayload {
    [index: string]: ArrayBuffer;
}
/**
 * Deprecated (older version of payloads, for older channels)
 */
export declare function extractPayloadV1(payload: ArrayBuffer): SBPayload;
/**
 * Assemble payload
 */
export declare function assemblePayload(data: SBPayload): BodyInit | null;
/**
 * Extract payload - this decodes from our binary (wire) format
 * to a JS object. This provides a binary encoding of any JSON,
 * and it allows some elements of the JSON to be raw (binary).
 */
export declare function extractPayload(payload: ArrayBuffer): SBPayload;
/**
 * Encode into b64 URL
 */
export declare function encodeB64Url(input: string): string;
/**
 * Decode b64 URL
 */
export declare function decodeB64Url(input: string): string;
/******************************************************************************************************
   ******************************************************************************************************/
/**
 * SBCrypto
 *
 * SBCrypto contains all the SB specific crypto functions,
 * as well as some general utility functions.
 *
 * @class
 * @constructor
 * @public
 */
declare class SBCrypto {
    /**
     * Extracts (generates) public key from a private key.
     */
    extractPubKey(privateKey: JsonWebKey): JsonWebKey | null;
    /**
     * SBCrypto.generatekeys()
     *
     * Generates standard ``ECDH`` keys using ``P-384``.
     */
    generateKeys(): Promise<CryptoKeyPair>;
    /**
     * SBCrypto.importKey()
     *
     * Import keys
     */
    importKey(format: KeyFormat, key: BufferSource | JsonWebKey, type: 'ECDH' | 'AES' | 'PBKDF2', extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey>;
    /**
     * SBCrypto.deriveKey()
     *
     * Derive key.
     */
    deriveKey(privateKey: CryptoKey, publicKey: CryptoKey, type: string, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey>;
    /**
     * SBCrypto.encrypt()
     *
     * Encrypt. if no nonce (iv) is given, will create it. Returns a Promise
     * that resolves either to raw array buffer or a packaged EncryptedContents.
     * Note that for the former, nonce must be given.
     */
    encrypt(data: BufferSource, key: CryptoKey, _iv?: Uint8Array | null, returnType?: 'encryptedContents'): Promise<EncryptedContents>;
    encrypt(data: BufferSource, key: CryptoKey, _iv?: Uint8Array | null, returnType?: 'arrayBuffer'): Promise<ArrayBuffer>;
    wrap(k: CryptoKey, b: string, bodyType: 'string'): Promise<EncryptedContents>;
    wrap(k: CryptoKey, b: ArrayBuffer, bodyType: 'arrayBuffer'): Promise<EncryptedContents>;
    /**
     * SBCrypto.unwrap
     *
     * Decrypts a wrapped object, returns (promise to) decrypted contents
     * per se (either as a string or arrayBuffer)
     */
    unwrap(k: CryptoKey, o: EncryptedContents, returnType: 'string'): Promise<string>;
    unwrap(k: CryptoKey, o: EncryptedContents, returnType: 'arrayBuffer'): Promise<ArrayBuffer>;
    /**
     * SBCrypto.sign()
     *
     * Sign
     */
    sign(secretKey: CryptoKey, contents: string): Promise<string>;
    /**
     * SBCrypto.verify()
     *
     * Verify signature.
     */
    verify(verifyKey: CryptoKey, sign: string, contents: string): Promise<boolean>;
    /**
     * Standardized 'str2ab()' function, string to array buffer.
     * This assumes on byte per character.
     *
     * @param {string} string
     * @return {Uint8Array} buffer
     */
    str2ab(string: string): Uint8Array;
    /**
     * Standardized 'ab2str()' function, array buffer to string.
     * This assumes one byte per character.
     *
     * @param {Uint8Array} buffer
     * @return {string} string
     */
    ab2str(buffer: Uint8Array): string;
    /**
     * SBCrypto.compareKeys()
     *
     * Compare JSON keys, true if the 'same', false if different.
     */
    compareKeys(key1: Dictionary<any>, key2: Dictionary<any>): boolean;
}
/**
 *
 * @class
 * @constructor
 * @public
 *
 */
declare class SB384 {
    #private;
    ready: Promise<SB384>;
    sb384Ready: Promise<SB384>;
    /**
     * Basic (core) capability object in SB.
     *
     * Note that all the getters below will throw an exception if the
     * corresponding information is not ready.
     *
     * Like most SB classes, SB384 follows the "ready template" design
     * pattern: the object is immediately available upon creation,
     * but isn't "ready" until it says it's ready. See `Channel Class`_
     * example below.
     *
     * @param key a jwk with which to create identity; if not provided,
     * it will 'mint' (generate) them randomly, in other words it will
     * default to creating a new identity ("384").
     *
     */
    constructor(key?: JsonWebKey);
    /** @type {boolean}       */ get readyFlag(): boolean;
    /** @type {JsonWebKey}    */ get exportable_pubKey(): JsonWebKey | null;
    /** @type {JsonWebKey}    */ get exportable_privateKey(): JsonWebKey | null;
    /** @type {CryptoKey}     */ get privateKey(): CryptoKey | null;
    /** @type {CryptoKeyPair} */ get keyPair(): CryptoKeyPair | null;
    /** @type {JsonWebKey}    */ get _id(): string;
    /** @type {string}        */ get ownerChannelId(): string | null;
}
interface SBMessageContents {
    sender_pubKey?: JsonWebKey;
    sender_username?: string;
    encrypted: boolean;
    isVerfied: boolean;
    contents: string;
    sign: string;
    image: string;
    image_sign?: string;
    imageMetadata_sign?: string;
    imageMetaData?: ImageMetaData;
}
declare const SB_MESSAGE_SYMBOL: unique symbol;
declare const SB_OBJECT_HANDLE_SYMBOL: unique symbol;
/**
 * SBMessage
 *
 * Body should be below 32KiB, though it tolerates up to 64KiB
 *
 * @class
 * @constructor
 * @public
 */
declare class SBMessage {
    ready: Promise<SBMessage>;
    channel: Channel;
    contents: SBMessageContents;
    [SB_MESSAGE_SYMBOL]: boolean;
    MAX_SB_BODY_SIZE: number;
    constructor(channel: Channel, body?: string);
    /**
     * SBMessage.send()
     *
     * @param {SBMessage} message - the message object to send
     */
    send(): Promise<string>;
}
/**
 * SBFile
 * @class
 * @constructor
 * @public
 */
export declare class SBFile extends SBMessage {
    #private;
    data: Dictionary<string>;
    image: string;
    image_sign: string;
    imageMetaData: ImageMetaData;
    constructor(channel: Channel, file: File);
}
/** SB384 */
/**
 * Channel
 *
 * @class
 * @constructor
 * @public
 */
declare abstract class Channel extends SB384 {
    #private;
    ready: Promise<Channel>;
    channelReady: Promise<Channel>;
    motd?: string;
    locked?: boolean;
    owner: boolean;
    admin: boolean;
    verifiedGuest: boolean;
    userName: string;
    abstract get keys(): ChannelKeys;
    abstract send(m: SBMessage | string, messageType?: 'string' | 'SBMessage'): Promise<string>;
    abstract set onMessage(f: CallableFunction);
    abstract adminData?: Dictionary<any>;
    /**
     * Join a channel, returns channel object.
     *
     * Currently, you must have an identity when connecting, because every single
     * message is signed by sender. TODO is to look at how to provide a 'listening'
     * mode on channels.
     *
     * Most classes in SB follow the "ready" template: objects can be used
     * right away, but they decide for themselves if they're ready or not.
     *
     * Below is a (complete) example for reference:
  
    .. parsed-literal::
      //
      // Here we create a new channel; for this we need to be specific
      // about what servers to use. This example references local dev
      // (miniflare) servers
      //
      const sb_config = {
        channel_server: \'http\:\/\/localhost\:4001\',
        channel_ws: \'ws://localhost:4001\',
        storage_server: \'http://localhost:4000\'
      }
      //
      // Next we create the orchestrator object, for above endpoints
      //
      const SB = new `Snackabra`_ (sb_config)
      //
      // On these servers, we create a new channel (trivial auth)
      //
      SB.create(sb_config, \'<SECRET>\').then((handle) => {
        //
        // This will return a 'handle', a type that contains all
        // the information you need to keep reference a channel.
        //
        SB.connect(
          //
          // Above we've created a channel, but not connected.
          // Besides some information in the handle, to connect we
          // must provide a message handler for all (new) messages
          //
          (m: ChannelMessage) => { console.log(\`got message: ${m}\`) },
          handle.key,
          handle.channelId
        ).then((c) => c.ready).then((c) => {
          //
          // We are now connected, \'c\' is a `Channel Socket Class`_
          // and can (optionally) pick a name (alias) for ourselves
          //
          c.userName = "TestBot"
          //
          // We can now send messages
          //
          (new `SBMessage`_ (c, "Hello from TestBot!")).send().then((c) => {
            console.log(\`test message sent! (${c})\`) })
        })
      })
  
  
     *
     * @param {Snackabra} sbServer server to join
     * @param {JsonWebKey} key? key to use to join (optional)
     * @param {string} channelId (the :term:`Channel Name`) to find on that server (optional)
     */
    constructor(sbServer: SBServer, key?: JsonWebKey, channelId?: string);
    /** @type {ChannelApi} */ get api(): ChannelApi;
    /** @type {SBServer} */ get sbServer(): SBServer;
    /** @type {string} */ get channelId(): string | undefined;
    /** @type {boolean} */ get readyFlag(): boolean;
}
/**
 *
 * ChannelSocket
 *
 *  Class managing connections
 */
export declare class ChannelSocket extends Channel {
    #private;
    ready: Promise<ChannelSocket>;
    adminData?: Dictionary<any>;
    /**
     * ChannelSocket
     *
     * @param sbServer: {SBServer}
     *
     * */
    constructor(sbServer: SBServer, onMessage: (m: ChannelMessage) => void, key?: JsonWebKey, channelId?: string);
    close: () => void;
    checkServerStatus(url: string, timeout: number, callback: (online: boolean) => void): void;
    get status(): "CLOSED" | "CONNECTING" | "OPEN" | "CLOSING";
    set onMessage(f: (m: ChannelMessage) => void);
    get onMessage(): (m: ChannelMessage) => void;
    set enableTrace(b: boolean);
    /**
     * ChannelSocket.keys
     *
     * Will throw an exception if keys are unknown or not yet loaded
     */
    get keys(): ChannelKeys;
    /**
     * ChannelSocket.sendSbObject()
     *
     * Send SB object (file) on channel socket
     */
    sendSbObject(file: SBFile): Promise<string>;
    /**
      * ChannelSocket.send()
      *
      * Returns a promise that resolves to "success" when sent,
      * or an error message if it fails.
      */
    send(msg: SBMessage | string): Promise<string>;
    /** @type {JsonWebKey} */ get exportable_owner_pubKey(): JsonWebKey | null;
}
export type SBObjectType = 'f' | 'p' | 'b';
export interface SBObjectHandle {
    [SB_OBJECT_HANDLE_SYMBOL]?: boolean;
    version: '1';
    type: SBObjectType;
    id: string;
    key: string;
    verification: Promise<string> | string;
    iv?: Uint8Array | string;
    salt?: Uint8Array | string;
    fileName?: string;
    dateAndTime?: string;
    shardServer?: string;
    fileType?: string;
    lastModified?: number;
    actualSize?: number;
    savedSize?: number;
}
export interface SBObjectMetadata {
    [SB_OBJECT_HANDLE_SYMBOL]: boolean;
    version: '1';
    type: SBObjectType;
    id: string;
    key: string;
    paddedBuffer: ArrayBuffer;
    iv: Uint8Array;
    salt: Uint8Array;
}
/**
 * Storage API
 * @class
 * @constructor
 * @public
 */
declare class StorageApi {
    #private;
    server: string;
    shardServer?: string;
    channelServer: string;
    constructor(server: string, channelServer: string, shardServer?: string);
    /**
     *
     * @param buf
     * @param type
     * @param roomId
     *
     */
    getObjectMetadata(buf: ArrayBuffer, type: SBObjectType): Promise<SBObjectMetadata>;
    /**
     * StorageApi.storeObject
     * @param buf
     * @param type
     * @param roomId
     *
     */
    storeObject(buf: BodyInit | Uint8Array, type: SBObjectType, roomId: SBChannelId, metadata?: SBObjectMetadata): Promise<SBObjectHandle>;
    /**
     * StorageApi.saveFile()
     *
     * @param channel
     * @param sbFile
     */
    saveFile(channel: Channel, sbFile: SBFile): void;
    /**
     * StorageApi().storeRequest
     */
    storeRequest(fileId: string): Promise<ArrayBuffer>;
    /**
     * StorageApi().storeData()
     */
    storeData(type: string, fileId: string, iv: Uint8Array, salt: Uint8Array, storageToken: string, data: ArrayBuffer): Promise<Dictionary<any>>;
    /**
     * StorageApi().storeImage()
     */
    storeImage(image: string | ArrayBuffer, image_id: string, keyData: string, type: string): void;
    /**
     * StorageApi().fetchData()
     *
     * This assumes you have a complete SBObjectHandle. Note that
     * if you only have the 'id' and 'verification' fields, you
     * can reconstruct / request the rest. The current interface
     * will return both nonce, salt, and encrypted data.
     *
     * @param h SBObjectHandle - the object to fetch
     * @param returnType 'string' | 'arrayBuffer' - the type of data to return (default: 'arrayBuffer')
     * @returns Promise<ArrayBuffer | string> - the shard data
     */
    fetchData(h: SBObjectHandle, returnType: 'string'): Promise<string>;
    fetchData(h: SBObjectHandle, returnType?: 'arrayBuffer'): Promise<ArrayBuffer>;
    /**
     * StorageApi().retrieveData()
     * retrieves an object from storage
     */
    retrieveImage(imageMetaData: ImageMetaData, controlMessages: Array<ChannelMessage>, imageId?: string, imageKey?: string, imageType?: SBObjectType): Promise<Dictionary<any>>;
}
/**
 * Channel API
 * @class
 * @constructor
 * @public
 */
declare class ChannelApi {
    #private;
    constructor(/* sbServer: Snackabra, */ channel: Channel);
    /**
     * getLastMessageTimes
     */
    getLastMessageTimes(): Promise<unknown>;
    /**
     * getOldMessages
     *
     * TODO: this needs to be able to check that the channel socket
     *       is ready, otherwise the keys might not be ... currently
     *       before calling this, make a ready check on the socket
     */
    getOldMessages(currentMessagesLength: number): Promise<Array<ChannelMessage>>;
    /**
     * Update (set) the capacity of the channel; Owner only
     */
    updateCapacity(capacity: number): Promise<any>;
    /**
     * getCapacity
     */
    getCapacity(): Promise<any>;
    /**
     * getJoinRequests
     */
    getJoinRequests(): Promise<any>;
    /**
     * isLocked
     */
    isLocked(): Promise<boolean>;
    /**
     * Set message of the day
     */
    setMOTD(motd: string): Promise<any>;
    /**
     * getAdminData
     */
    getAdminData(): Promise<unknown>;
    /**
     * downloadData
     */
    downloadData(): Promise<unknown>;
    uploadChannel(channelData: ChannelData): Promise<unknown>;
    authorize(ownerPublicKey: Dictionary<any>, serverSecret: string): Promise<any>;
    postPubKey(_exportable_pubKey: JsonWebKey): Promise<{
        success: boolean;
    }>;
    storageRequest(byteLength: number): Promise<Dictionary<any>>;
    lock(): Promise<unknown>;
    acceptVisitor(pubKey: string): Promise<unknown>;
    ownerKeyRotation(): Promise<unknown>;
}
declare class Snackabra {
    #private;
    /**
     * Constructor expects an object with the names of the matching servers, for example
     * below shows the miniflare local dev config. Note that 'new Snackabra()' is
     * guaranteed synchronous, so can be 'used' right away. You can optionally call
     * without a parameter in which case SB will ping known servers.
     *
     * ::
     *
     *     {
     *       channel_server: 'http://127.0.0.1:4001',
     *       channel_ws: 'ws://127.0.0.1:4001',
     *       storage_server: 'http://127.0.0.1:4000'
     *     }
     *
     * @param args {SBServer} server names (optional)
     * @param args {DEBUG} if set to true, will make ALL jslib calls verbose in the console
     *
     *
     */
    constructor(args?: SBServer, DEBUG?: boolean);
    /**
     * Connects to :term:`Channel Name` on this SB config.
     * Returns a channel object right away, but the channel
     * will not be ready until the ``ready`` promise is resolved.
     * Note that if you have a preferred server then the channel
     * object will be returned right away, but the ``ready`` promise
     * will still be pending. If you do not have a preferred server,
     * then the ``ready`` promise will be resolved when a least
     * one of the known servers is ready.
     */
    connect(onMessage: (m: ChannelMessage) => void, key?: JsonWebKey, channelId?: string): Promise<ChannelSocket>;
    /**
     * Creates a new channel. Currently uses trivial authentication.
     * Returns a promise to a ''SBChannelHandle'' object
     * (which includes the :term:`Channel Name`).
     * Note that this method does not connect to the channel,
     * it just creates (authorizes) it.
     */
    create(sbServer: SBServer, serverSecret: string, keys?: JsonWebKey): Promise<SBChannelHandle>;
    get channel(): Channel;
    get storage(): StorageApi;
    get crypto(): SBCrypto;
    sendFile(file: SBFile): void;
}
export { Channel, SBMessage, Snackabra, SBCrypto, SB384 };
export declare var SB: {
    Snackabra: typeof Snackabra;
    SBMessage: typeof SBMessage;
    Channel: typeof Channel;
    SBCrypto: typeof SBCrypto;
    SB384: typeof SB384;
};

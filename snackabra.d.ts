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
    /**
     * The channel server is the server that handles channel creation,
     * channel deletion, and channel access. It is also the server that
     * handles channel messages.
     */
    channel_server: string;
    /**
     * The channel websocket is the websocket that handles channel
     * messages. It is the same as the channel server, but with a
     * different protocol.
     */
    channel_ws: string;
    /**
     * The storage server is the server that all "shard" (blob) storage
     */
    storage_server: string;
    /**
     * "shard" server is a more modern version of the storage server,
     * generally acting as a caching and/or mirroring layer. It proxies
     * any new storage to one or more storage servers, and handles
     * it's own caching behavior. Generally, this will be the fastest
     * interface, in particular for reading.
     */
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
    motherChannel?: SBChannelId;
    SERVER_SECRET?: string;
    size?: number;
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

   @example
  ```ts
    {
      "encrypted":false,
      "contents":"Hello from test04d!",
      "sign":"u7zAM-1fNLZjmuayOkwWvXTBGqMEimOuzp1DJGX4ECg",
      "image":"",
      "imageMetaData":{},
      "sender_pubKey":
          {
            "crv":"P-384","ext":true,"key_ops":[],"kty":"EC",
            "x":"edqHd4aUn7dGsuDMQxtvzuw-Q2N7l77HBW81KvWj9qtzU7ab-sFHUBqogg2PKihj",
            "y":"Oqp27bXL4RUcAHpWUEFHZdyEuhTo8_8oyTsAKJDk1g_NQOA0FR5Sy_8ViTTWS9wT"
          },
      "sender_username":"TestBot",
      "image_sign":"3O0AYKthtWWYUX3AWDmdU4kTR49UyNyaA937CfKtcQw",
      "imageMetadata_sign":"4LmewpsH6TcRhHYQLivd4Ce87SI1AJIaezhJB5sdD7M"
    }
    ```

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
 * @param str - string in either regular or URL-friendly representation.
 * @return - returns decoded binary result
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
 * @param buffer - binary string
 * @param variant - 'b64' or 'url'
 * @return - returns Base64 encoded string
 */
declare function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array | null, variant?: 'b64' | 'url'): string;
/**
   A branded string type for base62 encoded strings.
   This is used to ensure that the string is a valid base62
   encoded string.
   
   "ArrayBuffer32" is a 256-bit array buffer. We use this
    as the ASCII representation of binary objects that are
    designed to be multiples of 256 bits. This has a number
    of advantages, and leverages the facts that 43 characters
    of base62 is slightly more than 256 bits (99.99% efficient).

    Note that this approach was not practical prior to es2020,
    when BigInt was added to JavaScript. BigInt allows us to
    work natively with 256-bit integers.

    The 'a32.' prefix is used to distinguish these from
    other base64 or other encodings. This is not strictly
    necessary, but it makes it easier to distinguish.
    Note that '.' is not a valid base62 nor base64 character.
    'a32.' refers to 'ArrayBuffer32' (256 bits), which we use
    as a basic type to represent 256-bit integers in 43
    characters of base62 [0-9A-Za-z]
 */
type Base62Encoded = string & {
    _brand?: 'Base62Encoded';
};
/**
 * base62ToArrayBuffer32 converts a base62 encoded string to an ArrayBuffer32.
 *
 * @param s base62 encoded string
 * @returns ArrayBuffer32
 */
export declare function base62ToArrayBuffer32(s: string): ArrayBuffer;
/**
 * arrayBuffer32ToBase62 converts an ArrayBuffer32 to a base62 encoded string.
 *
 * @param buffer ArrayBuffer32
 * @returns base62 encoded string
 */
export declare function arrayBuffer32ToBase62(buffer: ArrayBuffer): string;
/**
 * base62ToBase64 converts a base62 encoded string to a base64 encoded string.
 *
 * @param s base62 encoded string
 * @returns base64 encoded string
 *
 * @throws Error if the string is not a valid base62 encoded string
 */
export declare function base62ToBase64(s: string): string;
/**
 * base64ToBase62 converts a base64 encoded string to a base62 encoded string.
 *
 * @param s base64 encoded string
 * @returns base62 encoded string
 *
 * @throws Error if the string is not a valid base64 encoded string
 */
export declare function base64ToBase62(s: string): string;
export declare function isBase62Encoded(value: string): value is Base62Encoded;
/**
 * Appends two buffers and returns a new buffer
 *
 * @param {Uint8Array | ArrayBuffer} buffer1
 * @param {Uint8Array | ArrayBuffer} buffer2
 * @return {ArrayBuffer} new buffer
 *
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
     * Hashes and splits into two (h1 and h1) signature of data, h1
     * is used to request (salt, iv) pair and then h2 is used for
     * encryption (h2, salt, iv)
     *
     * @param buf blob of data to be stored
     *
     */
    generateIdKey(buf: ArrayBuffer): Promise<{
        id: string;
        key: string;
    }>;
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
 * Channel Class
 *
 * Join a channel, returns channel object.
 *
 * Currently, you must have an identity when connecting, because every single
 * message is signed by sender. TODO is to look at how to provide a 'listening'
 * mode on channels.
 *
 * Most classes in SB follow the "ready" template: objects can be used
 * right away, but they decide for themselves if they're ready or not.
 */
declare abstract class Channel extends SB384 {
    #private;
    /**
     * @param Snackabra - server to join
     * @param JsonWebKey - key to use to join (optional)
     * @param string - the [Channel Name](glossary.md#term-channel-name) to find on that server (optional)
     */
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
    constructor(sbServer: SBServer, key?: JsonWebKey, channelId?: string);
    /** @type {ChannelApi} */ get api(): ChannelApi;
    /** @type {SBServer} */ get sbServer(): SBServer;
    /** @type {string} */ get channelId(): string | undefined;
    /** @type {boolean} */ get readyFlag(): boolean;
}
/**
 *
 * ChannelEndpoint
 *
 * Gives access to a Channel API (without needing to connect to socket)
 */
export declare class ChannelEndpoint extends Channel {
    #private;
    adminData?: Dictionary<any>;
    constructor(sbServer: SBServer, key?: JsonWebKey, channelId?: string);
    get keys(): ChannelKeys;
    send(_m: SBMessage | string, _messageType?: 'string' | 'SBMessage'): Promise<string>;
    set onMessage(_f: CallableFunction);
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
export type SBObjectType = 'f' | 'p' | 'b' | 't';
export interface SBObjectHandle {
    [SB_OBJECT_HANDLE_SYMBOL]?: boolean;
    version?: '1';
    type: SBObjectType;
    id: string;
    key: string;
    id32?: Base62Encoded;
    key32?: Base62Encoded;
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
/**
 * Basic object handle for a shard (all storage).
 *
 * To RETRIEVE a shard, you need id and verification.
 * Next generation shard servers will only require id32.
 * Same goes for shard mirrors.
 *
 * To DECRYPT a shard, you need key, iv, and salt. Current
 * generation of shard servers will provide (iv, salt) upon
 * request if (and only if) you have id and verification.
 *
 * Note that id32/key32 are array32 encoded (a32). (Both
 * id and key are 256-bit entities).
 *
 * 'verification' is a 64-bit integer, encoded as a string
 * of up 23 characters: it is four 16-bit integers, either
 * joined by '.' or simply concatenated. Currently all four
 * values are random, future generation only first three
 * are guaranteed to be random, the fourth may be "designed".
 *
 *
 * @typedef {Object} SBObjectHandleClass
 * @property {boolean} [SB_OBJECT_HANDLE_SYMBOL] - flag to indicate this is an SBObjectHandle
 * @property {string} version - version of this object
 * @property {SBObjectType} type - type of object
 * @property {string} id - id of object
 * @property {string} key - key of object
 * @property {Base62Encoded} [id32] - optional: array32 format of id
 * @property {Base62Encoded} [key32] - optional: array32 format of key
 * @property {Promise<string>|string} verification - and currently you also need to keep track of this,
 * but you can start sharing / communicating the
 * object before it's resolved: among other things it
 * serves as a 'write-through' verification
 * @property {Uint8Array|string} [iv] - you'll need these in case you want to track an object
 * across future (storage) servers, but as long as you
 * are within the same SB servers you can request them.
 * @property {Uint8Array|string} [salt] - you'll need these in case you want to track an object
 * across future (storage) servers, but as long as you
 * are within the same SB servers you can request them.
 * @property {string} [fileName] - by convention will be "PAYLOAD" if it's a set of objects
 * @property {string} [dateAndTime] - optional: time of shard creation
 * @property {string} [shardServer] - optionally direct a shard to a specific server (especially for reads)
 * @property {string} [fileType] - optional: file type (mime)
 * @property {number} [lastModified] - optional: last modified time (of underlying file, if any)
 * @property {number} [actualSize] - optional: actual size of underlying file, if any
 * @property {number} [savedSize] - optional: size of shard (may be different from actualSize)
 *
 */
export declare class SBObjectHandleClass {
    #private;
    version: string;
    iv?: Uint8Array | string;
    salt?: Uint8Array | string;
    fileName?: string;
    dateAndTime?: string;
    shardServer?: string;
    fileType?: string;
    lastModified?: number;
    actualSize?: number;
    savedSize?: number;
    constructor(options: SBObjectHandle);
    set id(value: string);
    get id(): string;
    set key(value: string);
    get key(): string;
    set id32(value: Base62Encoded);
    set key32(value: Base62Encoded);
    get id32(): Base62Encoded;
    get key32(): Base62Encoded;
    set verification(value: Promise<string> | string);
    get verification(): Promise<string> | string;
    get type(): SBObjectType;
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
 *
 * Requires a Channel object to initialize. That can be a ChannelSocket, for
 * example, or if you just need access to send commands to the channel you
 * can use ChannelEndpoint (since "Channel" is an abstract class)
 *
 * @class
 * @constructor
 * @public
 */
declare class ChannelApi {
    #private;
    constructor(channel: Channel);
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
     * getStorageLimit (current storage budget)
     */
    getStorageLimit(): Promise<any>;
    /**
     * getMother
     *
     * Get the channelID from which this channel was budded. Note that
     * this is only accessible by Owner (as well as hosting server)
     */
    getMother(): Promise<any>;
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
    /**
     * "budd" will spin a channel off an existing one.
     * You need to provide one of the following combinations of info:
     *
     * - nothing (special case, create new channel and transfer all storage budget)
     * - just storage amount (creates new channel with that amount)
     * - just a target channel (moves all storage budget to that channel)
     * - just keys (creates new channel with those keys and transfers all storage budget)
     * - keys and storage amount (creates new channel with those keys and that storage amount)
     *
     * In the first (special) case you can just call budd(), in the other
     * cases you need to fill out the options object.
     *
     * Another way to remember the above: all combinations are valid except
     * both a target channel and assigning keys.
     *
     * Note: if you're specifying the target channel, then the return values will
     * not include the private key (that return value will be empty).
     */
    budd(): Promise<SBChannelHandle>;
    budd(options: {
        keys?: JsonWebKey;
        storage?: number;
        targetChannel?: SBChannelId;
    }): Promise<SBChannelHandle>;
}
/**
   * Snackabra is the main class for interacting with the Snackable backend.
   *
   * It is a singleton, so you can only have one instance of it.
   * It is guaranteed to be synchronous, so you can use it right away.
   * It is also guaranteed to be thread-safe, so you can use it from multiple
   * threads.
   *
  * Constructor expects an object with the names of the matching servers, for example
  * below shows the miniflare local dev config. Note that 'new Snackabra()' is
  * guaranteed synchronous, so can be 'used' right away. You can optionally call
  * without a parameter in which case SB will ping known servers.
  *
  * @example
  * ```typescript
  *     const sb = new Snackabra({
  *       channel_server: 'http://127.0.0.1:4001',
  *       channel_ws: 'ws://127.0.0.1:4001',
  *       storage_server: 'http://127.0.0.1:4000'
  *     })
  * ```
  *
  * Testing glossary links:
  *
  * * {@link glossary.html}
  */
declare class Snackabra {
    #private;
    /**
    * @param args - optional object with the names of the matching servers, for example
    * below shows the miniflare local dev config. Note that 'new Snackabra()' is
    * guaranteed synchronous, so can be 'used' right away. You can optionally call
    * without a parameter in which case SB will ping known servers.
    * @param DEBUG - optional boolean to enable debug logging
    */
    constructor(args?: SBServer, DEBUG?: boolean);
    /**
     * Connects to :term:`Channel Name` on this SB config.
     * Returns a channel socket promise right away, but it
     * will not be ready until the ``ready`` promise is resolved.
     * Note that if you have a preferred server then the channel
     * object will be returned right away, but the ``ready`` promise
     * will still be pending. If you do not have a preferred server,
     * then the ``ready`` promise will be resolved when a least
     * one of the known servers is ready.
     *
     * @param channelName - the name of the channel to connect to
     * @param key - optional key to use for encryption/decryption
     * @param channelId - optional channel id to use for encryption/decryption
     * @returns a channel object
     */
    connect(onMessage: (m: ChannelMessage) => void, key?: JsonWebKey, channelId?: string): Promise<ChannelSocket>;
    /**
     * Creates a new channel. Currently uses trivial authentication.
     * Returns a promise to a ''SBChannelHandle'' object
     * (which includes the :term:`Channel Name`).
     * Note that this method does not connect to the channel,
     * it just creates (authorizes) it.
     *
     * @param sbServer - the server to use
     * @param serverSecret - the server secret
     * @param keys - optional keys to use for encryption/decryption
     */
    create(sbServer: SBServer, serverSecret: string, keys?: JsonWebKey): Promise<SBChannelHandle>;
    /**
     * Connects to a channel.
     */
    get channel(): Channel;
    /**
     * Returns the storage API.
     */
    get storage(): StorageApi;
    /**
     * Returns the crypto API.
     */
    get crypto(): SBCrypto;
    /**
     * Sends a file to the channel.
     *
     * @param file - the file to send
     */
    sendFile(file: SBFile): void;
}
export { Channel, ChannelApi, SBMessage, Snackabra, SBCrypto, SB384, arrayBufferToBase64 };
export declare var SB: {
    Snackabra: typeof Snackabra;
    SBMessage: typeof SBMessage;
    Channel: typeof Channel;
    SBCrypto: typeof SBCrypto;
    SB384: typeof SB384;
    arrayBufferToBase64: typeof arrayBufferToBase64;
};

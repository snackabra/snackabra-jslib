/**
 * Interfaces
 */
interface SnackabraOptions {
    channel_server: string;
    channel_ws: string;
    storage_server: string;
}
interface SnackabraKeys {
    exportable_pubKey: JsonWebKey | Promise<JsonWebKey | null>;
    exportable_privateKey: JsonWebKey | Promise<JsonWebKey | null>;
    privateKey: CryptoKey | Promise<CryptoKey | null>;
}
interface Dictionary {
    [index: string]: any;
}
interface ImageMetaData {
    imageId?: string;
    previewId?: string;
    imageKey?: string;
    previewKey?: string;
}
interface ChannelMessage2 {
    type?: 'invalid' | 'ready';
    keys?: {
        ownerKey: Dictionary;
        encryptionKey: Dictionary;
        signKey: Dictionary;
    };
    _id?: string;
    id?: string;
    timestamp?: number;
    timestampPrefix?: string;
    channelID?: string;
    control?: boolean;
    encrypted_contents?: string;
    image?: string;
    imageMetaData?: ImageMetaData;
    motd?: string;
    ready?: boolean;
    roomLocked?: boolean;
    sender_pubKey?: JsonWebKey;
    system?: boolean;
    verficationToken?: string;
}
interface ChannelAckMessage {
    type: 'ack';
    _id: string;
}
interface ChannelMessage1 {
    [key: string]: ChannelMessage2;
}
export declare type ChannelMessage = ChannelMessage1 | ChannelMessage2 | ChannelAckMessage;
export declare function SB_libraryVersion(): string;
/**
 * SB simple events (mesage bus) class
 */
export declare class MessageBus {
    #private;
    bus: Dictionary;
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
/**
 * @fileoverview Main file for snackabra javascript utilities.
 *               See https://snackabra.io for details.
 * @package
 */
export declare function _sb_exception(loc: string, msg: string): void;
export declare function _sb_resolve(val: any): any;
export declare function _sb_assert(val: unknown, msg: string): void;
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
 * Standardized 'str2ab()' function, string to array buffer.
 * This assumes on byte per character.
 *
 * @param {string} string
 * @return {Uint8Array} buffer
 */
export declare function str2ab(string: string): Uint8Array;
/**
 * Standardized 'ab2str()' function, array buffer to string.
 * This assumes one byte per character.
 *
 * @return {Uint8Array} Uint8Array
 *
 * @param buffer
 */
export declare function ab2str(buffer: Uint8Array): string;
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
 * Standardized 'btoa()'-like function, e.g., takes a binary string
 * ('b') and returns a Base64 encoded version ('a' used to be short
 * for 'ascii').
 *
 * @param {bufferSource} ArrayBuffer buffer
 * @return {string} base64 string
 */
export declare function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array | null): string;
export declare function _appendBuffer(buffer1: Uint8Array | ArrayBuffer, buffer2: Uint8Array | ArrayBuffer): ArrayBuffer;
/**
 * Import a PEM encoded RSA public key, to use for RSA-OAEP
 * encryption.  Takes a string containing the PEM encoded key, and
 * returns a Promise that will resolve to a CryptoKey representing
 * the public key.
 *
 * @param {pem} RSA public key, string, PEM format
 * @return {cryptoKey} RSA-OAEP key
 *
 */
export declare function importPublicKey(pem?: string): Promise<CryptoKey>;
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
 * This is the base32mi disambiguation table ::
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
 * Another way to think of it is that this, becomes this ('.' means no change): ::
 *
 *     0123456789abcdefghijklmnopqrstuvxyzABCDEFGHIJKLMNOPQRSTUVXYZ
 *     ................9.1..1.N0.9.57UUk.248c0EF6.11kLm.0p0.5..Uky2
 *
 */
export declare function cleanBase32mi(s: string): string;
/**
 * Takes an arbitrary dict object, a public key in PEM
 * format, and a callback function: generates a random AES key,
 * wraps that in (RSA) key, and when all done will call the
 * callback function with the results
 *
 * @param {dict} dictionary (payload)
 * @param {publicKeyPEM} public key (PEM format)
 * @param {callback} callback function, called with results
 *
 */
export declare function packageEncryptDict(dict: Dictionary, publicKeyPEM: string, callback: CallableFunction): void;
/**
 * Partition
 */
export declare function partition(str: string, n: number): string[];
/**
 * There are o many problems with JSON parsing, adding a wrapper to capture more info.
 * The 'loc' parameter should be a (unique) string that allows you to find the usage
 * in the code; one approach is the line number in the file (at some point).
 */
export declare function jsonParseWrapper(str: string, loc: string): any;
/**
 * Extract payload
 */
export declare function extractPayloadV1(payload: ArrayBuffer): Dictionary;
/**
 * Assemble payload
 */
export declare function assemblePayload(data: Dictionary): {};
/**
 * Extract payload (latest version)
 */
export declare function extractPayload(payload: ArrayBuffer): Dictionary;
/**
 * Encode into b64 URL
 */
export declare function encodeB64Url(input: string): string;
/**
 * Decode b64 URL
 */
export declare function decodeB64Url(input: string): string;
/**
 * Crypto is a class that contains all the SB specific crypto functions
 *
 * @class
 * @constructor
 * @public
 */
declare class Crypto {
    /**
     * Extracts (generates) public key from a private key.
     */
    extractPubKey(privateKey: JsonWebKey): JsonWebKey | null;
    /**
     * Generates standard ``ECDH`` keys using ``P-384``.
     */
    generateKeys(): Promise<CryptoKeyPair>;
    /**
     * Import keys
     */
    importKey(format: 'raw' | 'pkcs8' | 'spki' | 'jwk', key: BufferSource | JsonWebKey, type: 'ECDH' | 'AES' | 'PBKDF2', extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey>;
    /**
     * Derive key.
     */
    deriveKey(privateKey: CryptoKey, publicKey: CryptoKey, type: string, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey>;
    /**
     * Get file key
     */
    getFileKey(fileHash: string, _salt: ArrayBuffer): Promise<unknown>;
    /**
     * Encrypt
     */
    encrypt(contents: BufferSource, secret_key: CryptoKey, outputType?: string, _iv?: ArrayBuffer | null): Promise<Dictionary>;
    /**
     * Decrypt
     */
    decrypt(secretKey: CryptoKey, contents: Dictionary, outputType?: string): Promise<string>;
    /**
     * Sign
     */
    sign(secretKey: CryptoKey, contents: string): Promise<string>;
    /**
     * Verify
     */
    verify(secretKey: CryptoKey, sign: string, contents: string): Promise<unknown>;
    /**
     * Compare keys
     */
    areKeysSame(key1: Dictionary, key2: Dictionary): boolean;
}
/**
 * Identity (key for use in SB)
 * @class
 * @constructor
 * @public
 */
declare class Identity implements SnackabraKeys {
    resolve_exportable_pubKey: (arg0: JsonWebKey | null) => void;
    resolve_exportable_privateKey: (arg0: JsonWebKey | null) => void;
    resolve_privateKey: (arg0: CryptoKey | null) => void;
    exportable_pubKey: Promise<JsonWebKey | null>;
    exportable_privateKey: Promise<JsonWebKey | null>;
    privateKey: Promise<CryptoKey | null>;
    /**
     * Mint keys
     */
    mintKeys(): Promise<unknown>;
    /**
     * Mount keys
     */
    mountKeys(key: JsonWebKey): Promise<unknown>;
    get _id(): string;
}
/**
 * SBMessage
 * @class
 * @constructor
 * @public
 */
declare class SBMessage {
    ready: any;
    signKey: CryptoKey;
    contents: {
        sender_pubKey: JsonWebKey;
    };
    encrypted: boolean;
    body: string;
    sign: string;
    image: string;
    image_sign: string;
    imageMetadata_sign: string;
    imageMetaData: ImageMetaData;
    sender_pubKey: JsonWebKey;
}
/**
 * SBFile
 * @class
 * @constructor
 * @public
 */
declare class SBFile {
    #private;
    encrypted: boolean;
    contents: string;
    senderPubKey: CryptoKey;
    sign: Promise<string>;
    data: Dictionary;
    image: string;
    image_sign: string;
    imageMetaData: ImageMetaData;
    imageMetadata_sign: string;
    constructor(file: File, signKey: CryptoKey, key: CryptoKey);
}
/**
 * Channel

 * @class
 * @constructor
 * @public
 */
declare class Channel {
    #private;
    sbServer: Snackabra;
    channel_id: string;
    identity: Identity;
    owner: boolean;
    admin: boolean;
    verifiedGuest: boolean;
    metaData: Dictionary;
    storage?: StorageApi;
    constructor(sbServer: Snackabra, identity: Identity, channel_id: string);
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
    init(server: string, channel: Channel, identity: Identity): void;
    /**
     * saveFile
     */
    saveFile(file: File): Promise<void>;
    /**
     * storeRequest
     */
    storeRequest(fileId: string): Promise<ArrayBuffer>;
    /**
     * storeData
     */
    storeData(type: string, fileId: string, encrypt_data: Dictionary, storageToken: string, data: Dictionary): Promise<Dictionary>;
    /**
     * storeImage
     */
    storeImage(image: string | ArrayBuffer, image_id: string, keyData: string, type: string): void;
    /**
     * fetchData
     */
    fetchData(msgId: string, verificationToken: string): Promise<ArrayBuffer>;
    /**
     * retrieveData (from storage)
     */
    retrieveData(msgId: string, messages: Array<ChannelMessage>, controlMessages: Array<ChannelMessage>): Promise<Dictionary>;
    /**
     * retrieveDataFromMessage
     */
    retrieveDataFromMessage(message: Dictionary, controlMessages: Array<Dictionary>): Promise<{
        error: string;
        url?: undefined;
    } | {
        url: string;
        error?: undefined;
    }>;
}
/**
 * QueueItem class
 *
 * @class
 * @constructor
 * @public
 */
/**
 * Queue Class
 *
 * @class
 * @constructor
 * @public
 */
/**
 * Constructor expects an object with the names of the matching servers, for example
 * (this shows the miniflare local dev config):
 * ::
 *
 *     {
 *       channel_server: 'http://127.0.0.1:4001',
 *       channel_ws: 'ws://127.0.0.1:4001',
 *       storage_server: 'http://127.0.0.1:4000'
 *     }
 *
 */
declare class Snackabra {
    #private;
    options: SnackabraOptions;
    /**
     */
    constructor(args: SnackabraOptions);
    setIdentity(keys: JsonWebKey): Promise<unknown>;
    createIdentity(): Promise<unknown>;
    /**
     * Connects to :term:`Channel Name` on this SB config.
     * Returns a (promise to a) channel object
     */
    connect(channel_id: string): Promise<Channel>;
    /**
     * Creates a channel. Currently uses trivial authentication.
     * Returns the :term:`Channel Name`.
     * (TODO: token-based approval of storage spend)
     */
    create(serverSecret: string): Promise<string>;
    get channel(): Channel;
    get storage(): StorageApi;
    get crypto(): Crypto;
    get identity(): Identity;
    sendMessage(message: SBMessage): void;
    sendFile(file: File): void;
}
export { Channel, Snackabra, SBMessage, SBFile, };

/**
 * @fileoverview Main file for snackabra javascript utilities.
 *               See https://snackabra.io for details.
 * @package
 */
export function _sb_exception(loc: any, msg: any): void;
export function _sb_resolve(val: any): any;
export function _sb_assert(val: any, msg: any): void;
/******************************************************************************************************/
/**
 * Fills buffer with random data
 */
export function getRandomValues(buffer: any): any;
/**
 * Returns 'true' if (and only if) string is well-formed base64.
 * Works same on browsers and nodejs.
 */
export function _assertBase64(base64: any): boolean;
/**
 * Standardized 'str2ab()' function, string to array buffer.
 * This assumes on byte per character.
 *
 * @param {string} string
 * @return {Uint8Array} buffer
 */
export function str2ab(string: string): Uint8Array;
/**
 * Standardized 'ab2str()' function, array buffer to string.
 * This assumes one byte per character.
 *
 * @param {Uint8Array} buffer
 * @return {string} string
 */
export function ab2str(buffer: Uint8Array): string;
/**
 * Standardized 'atob()' function, e.g. takes the a Base64 encoded
 * input and decodes it. Note: always returns Uint8Array.
 * Accepts both regular Base64 and the URL-friendly variant,
 * where `+` => `-`, `/` => `_`, and the padding character is omitted.
 *
 * @param {str} base64 string in either regular or URL-friendly representation.
 * @return {Uint8Array} returns decoded binary result
 */
export function base64ToArrayBuffer(str: any): Uint8Array;
/**
 * Compare buffers
 */
export function compareBuffers(a: any, b: any): boolean;
/**
 * Standardized 'btoa()'-like function, e.g., takes a binary string
 * ('b') and returns a Base64 encoded version ('a' used to be short
 * for 'ascii').
 *
 * @param {bufferSource} ArrayBuffer buffer
 * @return {string} base64 string
 */
export function arrayBufferToBase64(buffer: any): string;
export function _appendBuffer(buffer1: any, buffer2: any): ArrayBufferLike;
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
export function importPublicKey(pem: any): cryptoKey;
/**
 * Returns random number
 *
 * @return {int} integer 0..255
 *
 */
export function simpleRand256(): int;
/**
 * Returns a random string in requested encoding
 *
 * @param {n} number of characters
 * @param {code} encoding, supported types: 'base32mi'
 * @return {string} random string
 *
 * base32mi: ``0123456789abcdefyhEjkLmNHpFrRTUW``
 */
export function simpleRandomString(n: any, code: any): string;
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
export function cleanBase32mi(s: any): any;
/**
 * Takes an arbitrary dict object, a public key in PEM
 * format, and a callback function: generates a random AES key,
 * wraps that in (RSA) key, and when all done will call the
 * callback function with the results.
 *
 * This function is for direct use in a web page, for example
 * capturing a 'form' input set of data about a user, and
 * sending towards a backend in such a way that the contents
 * can only be decrypted and read off-line (air gapped).
 *
 * @param {dict} dictionary (payload)
 * @param {publicKeyPEM} public key (PEM format)
 * @param {callback} callback function, called with results
 *
 */
export function packageEncryptDict(dict: any, publicKeyPEM: any, callback: any): void;
/**
 * Partition
 */
export function partition(str: any, n: any): any[];
/**
 * There are many problems with JSON parsing, adding a wrapper to capture more info.
 * The 'loc' parameter should be a (unique) string that allows you to find the usage
 * in the code; one approach is the line number in the file (at some point).
 */
export function jsonParseWrapper(str: any, loc: any): any;
/**
 * Deprecated (older version of payloads, for older channels)
 */
export function extractPayloadV1(payload: any): {};
/**
 * Assemble payload
 */
export function assemblePayload(data: any): ArrayBuffer | null;
/**
 * Extract payload - this decodes from our binary (wire) format
 * to a JS object. This provides a binary encoding of any JSON,
 * and it allows some elements of the JSON to be raw (binary).
 */
export function extractPayload(payload: any): {};
/**
 * Encode into b64 URL
 */
export function encodeB64Url(input: any): any;
/**
 * Decode b64 URL
 */
export function decodeB64Url(input: any): any;
/******************************************************************************************************/
/**
 * SB simple events (mesage bus) class
 */
export class MessageBus {
    bus: {};
    /**
     * Subscribe. 'event' is a string, special case '*' means everything
     *  (in which case the handler is also given the message)
     */
    subscribe(event: any, handler: any): void;
    /**
     * Unsubscribe
     */
    unsubscribe(event: any, handler: any): void;
    /**
     * Publish
     */
    publish(event: any, ...args: any[]): void;
    #private;
}
/**
 * SBFile
 * @class
 * @constructor
 * @public
 */
export class SBFile extends SBMessage {
    constructor(channel: any, file: any);
    data: {
        previewImage: string;
        fullImage: string;
    };
    image: string;
    image_sign: string;
    imageMetaData: {};
    #private;
}
/**
 * SBMessage
 * @class
 * @constructor
 * @public
 */
export class SBMessage {
    constructor(channel: any, body?: string);
    ready: Promise<any>;
    channel: any;
    contents: {
        encrypted: boolean;
        contents: string;
        sign: string;
        image: string;
        imageMetaData: {};
    };
    /**
     * SBMessage.send()
     *
     * @param {SBMessage} message - the message object to send
     */
    send(): Promise<any>;
}
/**
 * Channel
 *
 * @class
 * @constructor
 * @public
 */
export class Channel extends SB384 {
    constructor(sbServer: any, key: any, channelId: any);
    channelReady: Promise<any>;
    motd: string;
    locked: boolean;
    owner: boolean;
    admin: boolean;
    verifiedGuest: boolean;
    userName: string;
    get api(): ChannelApi;
    get sbServer(): any;
    get channelId(): any;
    #private;
}
export class Snackabra {
    /**
     * Constructor expects an object with the names of the matching servers, for example
     * below shows the miniflare local dev config. Note that 'new Snackabra()' is
     * guaranteed synchronous, so can be 'used' right away. You can optionally call
     * without a parameter in which case SB will ping known servers.
     *
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
     *
     *
     */
    constructor(args: SBServer);
    /**
     * Snackabra.connect()
     *
     * Connects to :term:`Channel Name` on this SB config.
     * Returns a (promise to the) channel (socket) object.
     * It will throw an ``AggregateError`` if it fails
     * to find the room anywhere.
     *
     */
    connect(onMessage: any, key: any, channelId: any): Promise<any>;
    /**
     * Snackabra.create()
     *
     * Creates a new channel. Currently uses trivial authentication.
     * Returns the :term:`Channel Name`. Note that this does not
     * create a channel object, e.g. does not make a connection.
     * Therefore you need
     *
     * (TODO: token-based approval of storage spend)
     */
    create(sbServer: any, serverSecret: any, keys: any): Promise<any>;
    get channel(): any;
    get storage(): StorageApi | undefined;
    get crypto(): SBCrypto;
    sendFile(file: any): void;
    #private;
}
/******************************************************************************************************/
/**
 * SBCrypto contains all the SB specific crypto functions
 *
 * @class
 * @constructor
 * @public
 */
export class SBCrypto {
    /**
     * Extracts (generates) public key from a private key.
     */
    extractPubKey(privateKey: any): any;
    /**
     * SBCrypto.generatekeys()
     *
     * Generates standard ``ECDH`` keys using ``P-384``.
     */
    generateKeys(): Promise<any>;
    /**
     * SBCrypto.importKey()
     *
     * Import keys
     */
    importKey(format: any, key: any, type: any, extractable: any, keyUsages: any): Promise<CryptoKey>;
    /**
     * SBCrypto.deriveKey()
     *
     * Derive key.
     */
    deriveKey(privateKey: any, publicKey: any, type: any, extractable: any, keyUsages: any): Promise<any>;
    encrypt(data: any, key: any, _iv: any, returnType?: string): Promise<any>;
    wrap(k: any, b: any, bodyType: any): Promise<any>;
    unwrap(k: any, o: any, returnType: any): Promise<any>;
    /**
     * SBCrypto.sign()
     *
     * Sign
     */
    sign(secretKey: any, contents: any): Promise<any>;
    /**
     * SBCrypto.verify()
     *
     * Verify
     */
    verify(secretKey: any, sign: any, contents: any): Promise<any>;
    /**
     * SBCrypto.compareKeys()
     *
     * Compare keys, true if the 'same', false if different.
     * TODO: type it up.
     */
    compareKeys(key1: any, key2: any): boolean;
}
/**
 * SB384 - basic (core) capability object in SB
 * @class
 * @constructor
 * @public
 */
declare class SB384 {
    /**
     * new SB384()
     * @param key a jwk with which to create identity; if not provided,
     * it will 'mint' (generate) them randomly
     */
    constructor(key: any);
    ready: Promise<any>;
    sb384Ready: Promise<any>;
    get readyFlag(): boolean;
    get exportable_pubKey(): null;
    get exportable_privateKey(): null;
    get privateKey(): null;
    get keyPair(): null;
    get _id(): string;
    get ownerChannelId(): null;
    #private;
}
/**
 * Channel API
 * @class
 * @constructor
 * @public
 */
declare class ChannelApi {
    constructor(channel: any);
    /**
     * getLastMessageTimes
     */
    getLastMessageTimes(): Promise<any>;
    /**
     * getOldMessages
     */
    getOldMessages(currentMessagesLength: any): Promise<any>;
    /**
     * updateCapacity
     */
    updateCapacity(capacity: any): Promise<any>;
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
    isLocked(): Promise<any>;
    /**
     * Set message of the day
     */
    setMOTD(motd: any): Promise<any>;
    /**
     * getAdminData
     */
    getAdminData(): Promise<any>;
    /**
     * downloadData
     */
    downloadData(): Promise<any>;
    uploadChannel(channelData: any): Promise<any>;
    authorize(ownerPublicKey: any, serverSecret: any): Promise<any>;
    postPubKey(_exportable_pubKey: any): Promise<any>;
    storageRequest(byteLength: any): Promise<any>;
    #private;
}
/**
 * Storage API
 * @class
 * @constructor
 * @public
 */
declare class StorageApi {
    constructor(server: any, channelServer: any);
    server: string;
    channelServer: string;
    /**
     *
     * @param buf
     * @param type
     * @param roomId
     * @returns
     */
    storeObject(buf: any, type: any, roomId: any): Promise<any>;
    /**
     * StorageApi.saveFile()
     */
    saveFile(channel: any, sbFile: any): Promise<void>;
    /**
     * StorageApi().storeRequest
     */
    storeRequest(fileId: any): Promise<any>;
    /**
     * StorageApi().storeData()
     */
    storeData(type: any, fileId: any, iv: any, salt: any, storageToken: any, data: any): Promise<any>;
    /**
     * StorageApi().storeImage()
     */
    storeImage(image: any, image_id: any, keyData: any, type: any): void;
    /**
     * StorageApi().fetchData()
     *
     * This assumes you have a complete SBObjectHandle. Note that
     * if you only have the 'id' and 'verification fields, you
     * can reconstruct / request the rest. The current interface
     * will return both nonce, salt, and encrypted data.
     */
    fetchData(h: any): Promise<any>;
    /**
     * StorageApi().retrieveData()
     * retrieves an object from storage
     */
    retrieveData(msgId: any, messages: any, controlMessages: any): Promise<{
        error: string;
        url?: undefined;
    } | {
        url: string;
        error?: undefined;
    }>;
    /**
     * StorageApi().retrieveDataFromMessage()
     */
    retrieveDataFromMessage(message: any, controlMessages: any): Promise<{
        error: string;
        url?: undefined;
    } | {
        url: string;
        error?: undefined;
    }>;
    #private;
}
export {};

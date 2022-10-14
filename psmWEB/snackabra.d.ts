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
interface ChannelData {
    roomId?: string;
    channelId?: string;
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
}
interface ChannelMessage2 {
    type?: 'invalid' | 'ready';
    keys?: {
        ownerKey: Dictionary;
        encryptionKey: Dictionary;
        guestKey?: Dictionary;
        signKey: Dictionary;
    };
    _id?: string;
    id?: string;
    timestamp?: number;
    timestampPrefix?: string;
    channelID?: string;
    control?: boolean;
    encrypted_contents?: EncryptedContents;
    image?: string;
    imageMetaData?: ImageMetaData;
    motd?: string;
    ready?: boolean;
    roomLocked?: boolean;
    sender_pubKey?: JsonWebKey;
    system?: boolean;
    verificationToken?: string;
}
interface ChannelAckMessage {
    type: 'ack';
    _id: string;
}
interface ChannelKeyStrings {
    encryptionKey: string;
    guestKey?: string;
    ownerKey: string;
    signKey: string;
    lockedKey?: string;
}
interface ChannelKeys {
    ownerKey: CryptoKey;
    guestKey?: CryptoKey;
    encryptionKey: CryptoKey;
    signKey: CryptoKey;
    lockedKey?: CryptoKey;
    channelSignKey: CryptoKey;
}
interface ChannelKeysMessage {
    type: 'channelKeys';
    ready: boolean;
    keys: ChannelKeyStrings;
    motd: string;
    roomLocked: boolean;
}
/** Encryptedcontents

    SB standard wrapping encrypted messages.

    Encryption is done with AES-GCM, 16 bytes of salt (iv), The
    ``contents`` are base64 and made web/net safe by running through
    encodeURIComponent. Same thing with the nonce (iv).
 */
export interface EncryptedContents {
    content: string;
    iv: string;
}
interface ChannelEncryptedMessage {
    type: 'channelMessage';
    channelID?: string;
    timestampPrefix?: string;
    encrypted_contents: EncryptedContents;
}
interface ChannelEncryptedMessageArray {
    type: 'channelMessageArray';
    messages: ChannelEncryptedMessageArray[];
}
export declare type ChannelMessage = ChannelKeysMessage | ChannelEncryptedMessage | ChannelEncryptedMessageArray | void;
export declare type ChannelMessageTypes = 'ack' | 'channelMessage' | 'channelMessageArray' | 'channelKeys';
/**
 * deserializeMessage()
 *
 * @param {string} m raw message string
 * @param {ChannelMessageTypes} expect expected (required) type (exception if it's not)
 */
/**
 * serializeMessage()
 *
 * Serializes any SB message type.
 *
 * @param {ChannelMessage} SB message object
 */
interface ChannelMessage1 {
    [key: string]: ChannelMessage2;
    message: {
        [prop: string]: any;
    };
}
export declare type ChannelMessageV1 = ChannelMessage1 | ChannelMessage2 | ChannelAckMessage;
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
export declare function packageEncryptDict(dict: Dictionary, publicKeyPEM: string, callback: CallableFunction): void;
/**
 * Partition
 */
export declare function partition(str: string, n: number): string[];
/**
 * There are many problems with JSON parsing, adding a wrapper to capture more info.
 * The 'loc' parameter should be a (unique) string that allows you to find the usage
 * in the code; one approach is the line number in the file (at some point).
 */
export declare function jsonParseWrapper(str: string, loc: string): any;
/**
 * Deprecated (older version of payloads, for older channels)
 */
export declare function extractPayloadV1(payload: ArrayBuffer): Dictionary;
/**
 * Assemble payload
 */
export declare function assemblePayload(data: Dictionary): BodyInit | null;
/**
 * Extract payload - this decodes from our binary (wire) format
 * to a JS object. This provides a binary encoding of any JSON,
 * and it allows some elements of the JSON to be raw (binary).
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
 * SBCrypto is a class that contains all the SB specific crypto functions
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
     * SBCrypto.getFileKey()
     *
     * Get file key
     */
    getFileKey(fileHash: string, _salt: ArrayBuffer): Promise<unknown>;
    /**
     * SBCrypto.encrypt()
     *
     * Encrypt
     */
    encrypt(contents: BufferSource, secret_key: CryptoKey, outputType?: string, _iv?: ArrayBuffer | null): Promise<Dictionary | string>;
    /**
     * SBCrypto.decrypt()
     *
     * Decrypt. Defunct, replaced by unwrap()
     */
    decrypt(secretKey: CryptoKey, contents: Dictionary, outputType?: string): Promise<string>;
    /**
     * SBCrypto.unwrap
     *
     * Decrypts a wrapped object, returns decrypted contents
     */
    unwrap(k: CryptoKey, o: EncryptedContents): Promise<string>;
    /**
     * SBCrypto.wrap
     *
     * Encrypts
     */
    /**
     * SBCrypto.sign()
     *
     * Sign
     */
    sign(secretKey: CryptoKey, contents: string): Promise<string>;
    /**
     * SBCrypto.verify()
     *
     * Verify
     */
    verify(secretKey: CryptoKey, sign: string, contents: string): Promise<unknown>;
    /**
     * SBCrypto.areKeysSame()
     *
     * Compare keys. (TODO: deprecate/ change)
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
    ready: Promise<Identity>;
    resolve_exportable_pubKey: (arg0: JsonWebKey | null) => void;
    resolve_exportable_privateKey: (arg0: JsonWebKey | null) => void;
    resolve_privateKey: (arg0: CryptoKey | null) => void;
    exportable_pubKey: Promise<JsonWebKey | null>;
    exportable_privateKey: Promise<JsonWebKey | null>;
    privateKey: Promise<CryptoKey | null>;
    constructor(keys?: JsonWebKey);
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
interface SBMessageContents {
    sender_pubKey?: JsonWebKey;
    encrypted: boolean;
    body: string;
    sign: string;
    image: string;
    image_sign?: string;
    imageMetadata_sign?: string;
    imageMetaData?: ImageMetaData;
}
/**
 * SBMessage
 * @class
 * @constructor
 * @public
 */
declare class SBMessage {
    ready: Promise<SBMessage>;
    channel: Channel;
    identity?: Identity;
    contents: SBMessageContents;
    constructor(channel: Channel, body: string, identity?: Identity);
    /**
     * SBMessage.send()
     *
     * @param {SBMessage} message - the message object to send
     */
    send(): Promise<void>;
}
/**
 * SBFile
 * @class
 * @constructor
 * @public
 */
export declare class SBFile extends SBMessage {
    data: Dictionary;
    image: string;
    image_sign: string;
    imageMetaData: ImageMetaData;
    imageMetadata_sign: string;
    constructor(channel: Channel, file: File, identity?: Identity);
}
/**
 * Channel
 *
 * @class
 * @constructor
 * @public
 */
declare class Channel {
    #private;
    ready: () => Promise<ChannelSocket>;
    sbServer: Snackabra;
    channel_id: string;
    defaultIdentity?: Identity;
    motd?: string;
    locked?: boolean;
    owner: boolean;
    admin: boolean;
    verifiedGuest: boolean;
    constructor(sbServer: Snackabra, channel_id: string, identity?: Identity);
    /**
     * Channel.send()
     */
    send(m: SBMessage): Promise<unknown>;
    set onMessage(f: CallableFunction);
    /**
     * Channel.keys()
     *
     * Return (promise to) keys, which will show up on socket
     */
    get keys(): Promise<ChannelKeys>;
    /**
     * Channel.api()
     */
    get api(): ChannelApi;
}
/**
 *
 * ChannelSocket
 *
 *  Class managing connections
 */
declare class ChannelSocket {
    #private;
    ready: Promise<ChannelSocket>;
    channelId: string;
    processingKeys: boolean;
    constructor(sbServer: Snackabra, channel: Channel, identity: Identity);
    set onMessage(f: CallableFunction);
    get keys(): Promise<ChannelKeys>;
    /**
     * ChannelSocket.sendSbObject()
     *
     * Send SB object (file) on channel socket
     */
    sendSbObject(file: SBFile): Promise<unknown>;
    /**
      * ChannelSocket.send()
      *
      *
      */
    send(message: SBMessage): Promise<unknown>;
    /**
      * ChannelSocket.receive()
      *
      * Receive message on channel socket.
      *
      * Moving to new message types
      */
    receive(message: ChannelMessage2): Promise<string | ChannelMessage2>;
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
    constructor(server: string);
    /**
     * StorageApi.saveFile()
     */
    saveFile(sbFile: SBFile, channel: Channel): Promise<void>;
    /**
     * StorageApi().storeRequest
     */
    storeRequest(fileId: string): Promise<ArrayBuffer>;
    /**
     * StorageApi().storeData()
     */
    storeData(type: string, fileId: string, encrypt_data: Dictionary, storageToken: string, data: Dictionary): Promise<Dictionary>;
    /**
     * StorageApi().storeImage()
     */
    storeImage(image: string | ArrayBuffer, image_id: string, keyData: string, type: string): void;
    /**
     * StorageApi().fetchData()
     */
    fetchData(msgId: string, verificationToken: string | undefined): Promise<ArrayBuffer>;
    /**
     * StorageApi().retrieveData()
     * retrieves an object from storage
     */
    retrieveData(msgId: string, messages: Array<ChannelMessage2>, controlMessages: Array<ChannelMessage2>): Promise<Dictionary>;
    /**
     * StorageApi().retrieveDataFromMessage()
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
 * Channel API
 * @class
 * @constructor
 * @public
 */
declare class ChannelApi {
    #private;
    constructor(sbServer: Snackabra, channel: Channel, identity?: Identity);
    /**
     * getLastMessageTimes
     */
    getLastMessageTimes(): Promise<unknown>;
    /**
     * getOldMessages
     */
    getOldMessages(currentMessagesLength: number): Promise<unknown>;
    /**
     * updateCapacity
     */
    updateCapacity(capacity: number): Promise<unknown>;
    /**
     * getCapacity
     */
    getCapacity(): Promise<unknown>;
    /**
     * getJoinRequests
     */
    getJoinRequests(): Promise<unknown>;
    /**
     * isLocked
     */
    isLocked(): Promise<unknown>;
    /**
     * Set message of the day
     */
    setMOTD(motd: string): Promise<unknown>;
    /**
     * getAdminData
     */
    getAdminData(): Promise<unknown>;
    /**
     * downloadData
     */
    downloadData(): Promise<unknown>;
    uploadChannel(channelData: ChannelData): Promise<unknown>;
    authorize(ownerPublicKey: Dictionary, serverSecret: string): Promise<unknown>;
    postPubKey(_exportable_pubKey: Dictionary): Promise<unknown>;
    storageRequest(byteLength: number): Promise<Dictionary>;
}
declare class Snackabra {
    #private;
    defaultIdentity?: Identity;
    options: SnackabraOptions;
    /**
     * Constructor expects an object with the names of the matching servers, for example
     * (this shows the miniflare local dev config):
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
     * @param args {SnackabraOptions} interface
     */
    constructor(args: SnackabraOptions);
    /**
     * Snackabra.connect()
     * Connects to :term:`Channel Name` on this SB config.
     * Returns a (promise to the) channel object
     * @param {string} channel name
     * @param {Identity} default identity for all messages
     */
    connect(channel_id: string, identity: Identity): Promise<Channel>;
    /**
     * Creates a new channel. Currently uses trivial authentication.
     * Returns the :term:`Channel Name`.
     * (TODO: token-based approval of storage spend)
     */
    create(serverSecret: string, identity: Identity): Promise<string>;
    get channel(): Channel;
    get storage(): StorageApi;
    get crypto(): SBCrypto;
    get identity(): Identity;
    set identity(identity: Identity);
    sendMessage(message: SBMessage): void;
    sendFile(file: SBFile): void;
}
export { Channel, Identity, SBMessage, Snackabra, };

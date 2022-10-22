// PUNTED and still relevant


  // onError() {
  //   this.currentWebSocket.addEventListener('error', (event) => {
  //     console.error('WebSocket error, reconnecting:', event);
  //     if (typeof this.options.onError === 'function') this.options.onError(event)
  //   });
  // }

  // onClose() {
  //   this.currentWebSocket.addEventListener('close', (event) => {
  //     console.info('Websocket closed', event);
  //     if (typeof this.options.onClose === 'function') this.options.onClose(event)
  //   });
  // }


  // return new Promise(async (resolve, reject) => {
  //   try {
  //     const msg = {encrypted_contents: await sbCrypto.encrypt(str2ab(JSON.stringify(contents)), key, 'string')};
  //     resolve(JSON.stringify(msg));
  //   } catch (e) {
  //     console.error(e);
  //     reject(new Error('Unable to encrypt payload.'));
  //   }
  // });

  // moved to SBCrypto
  // async unwrap(payload: Dictionary, key: CryptoKey) {
  //   try {
  //     const msg = await sbCrypto.decrypt(key, payload.encrypted_contents);
  //     // psm: i think this throws in case of error
  //     // if (msg['error']) {
  //     //   return {error: msg['error']};
  //     // }
  //     return msg;
  //   } catch (e) {
  //     return { error: `Error: ${e}` };
  //   }
  // }


  /**
   * ChannelSocket.close()
   */
  // close() {
  //   this.sbWebSocket.close();
  // }

  /**
   * ChannelSocket.isReady()
   */
  // isReady() {
  //   console.info('SB Socket ready');
  //   this.ready = true;
  //   if (this.#queue.length > 0) {
  //     this.#queue.forEach((message) => {
  //       this.send(message);
  //     });
  //   }
  // }

  // message.ready.then(() => {
  //   if (this.ready) {
  // 	let payload;
  // 	this.#payload.wrap(
  //       message,
  //       this.#channel.keys.encryptionKey
  // 	).then((payload) => { this.socket.send(payload) });
  //   } else {
  // 	this.#queue.push(message);
  //   }
  // });


// /** ChannelSocket.open() */
// #open(ws: WebSocket) {
//   const options: WSProtocolOptions = {
//     url: this.#url + '/api/room/' + this.channelId + '/websocket',
//     onOpen: async (event: WebSocketEventMap) => {
//       console.log('websocket opened');
//       if (typeof this.onOpen === 'function') this.onOpen(event)
//     },
//     onMessage: async (event: ChannelMessage2) => {
//       console.log("****** start: onMessage() *****")
//       console.log(event)
//       console.log("****** end: onMessage() *****")
//       if (event?.ready) {
//         if (typeof this.onJoin === 'function') {
//           this.onJoin(event);
//           if (typeof this.onSystemInfo === 'function') this.onSystemInfo(event)
//         }
//       } else if (event?.system) {
//         if (typeof this.onSystemInfo === 'function') this.onSystemInfo(event)
//       } else {
//         if (typeof this.onMessage === 'function') this.onMessage(await this.receive(event))
//       }
//     },
//     onClose: (event: WebSocketEventMap) => {
//       if (typeof this.onClose === 'function') this.onClose(event)
//     },
//     onError: (event: WebSocketEventMap) => {
//       if (typeof this.onError === 'function') this.onError(event)
//     }
//   };
//   // this.sbWebSocket = new WS_Protocol(options);
//   this.#options = Object.assign(this.#options, options)
// }




  //   ... all of this is getting rolled in elsewhere ...
  //   loadKeys(keys: Dictionary) {
  //     return new Promise(async (resolve, reject) => {
  //       const _self = this
  //       if (keys.ownerKey === null) {
  //         console.error('did not receive owner keys - probably means no such channel')
  //         reject(new Error('Channel does not exist'));
  //       }
  //       let _exportable_owner_pubKey: Dictionary = jsonParseWrapper(keys.ownerKey || JSON.stringify({}), 'L1460');
  //       if (_exportable_owner_pubKey.key) {
  //         _exportable_owner_pubKey = typeof _exportable_owner_pubKey.key === 'object' ? _exportable_owner_pubKey.key : jsonParseWrapper(_exportable_owner_pubKey.key, 'L1463');
  //       }
  //       try {
  //         _exportable_owner_pubKey.key_ops = [];
  //       } catch (error) {
  //         reject(error);
  //       }
  //       const _exportable_room_signKey: JsonWebKey = jsonParseWrapper(keys.signKey, 'L1470');
  //       const _exportable_encryption_key: JsonWebKey = jsonParseWrapper(keys.encryptionKey, 'L1471');
  //       let _exportable_verifiedGuest_pubKey: JsonWebKey = jsonParseWrapper(keys.guestKey || null, 'L1472');
  //       const _exportable_pubKey: JsonWebKey = await _self.defaultIdentity!.exportable_pubKey.then();
  //       const _privateKey: CryptoKey = await _self.defaultIdentity!.privateKey.then();
  //       let isVerifiedGuest = false;
  //       const _owner_pubKey = await sbCrypto.importKey('jwk', _exportable_owner_pubKey, 'ECDH', false, []);
  //       const isOwner = sbCrypto.areKeysSame(_exportable_pubKey, _exportable_owner_pubKey);

  //       // TODO: this handles the cookie/admin mechanism from an SSO
  //       // BROWSER
  //       // hardcoded to only trust cookies from 'privacy.app' SSO (MI):
  //       // const isAdmin: boolean = (document.cookie.split('; ').find((row: string) =>
  //       //     row.startsWith('token_' + this._id)) !== undefined) || (this.url !== 'https://s_socket.privacy.app' && isOwner);
  //       // NODE? not sure what fallback this is:
  //       //   const isAdmin: boolean = (this.url !== 'https://s_socket.privacy.app' && isOwner);
  //       // and this might be local dev override?
  //       //   const isAdmin = (process.env.REACT_APP_ROOM_SERVER !== 's_socket.privacy.app' && isOwner);

  //       // for now disabled feature (TODO this is for SSO support which adds an 'admin' status)
  //       const isAdmin: boolean = false

  //       if (!isOwner && !isAdmin) {
  //         if (_exportable_verifiedGuest_pubKey === null) {
  //           // PSM: actually this appears to be an old bug, there's a race condition here
  //           this.api.postPubKey(_exportable_pubKey);
  //           _exportable_verifiedGuest_pubKey = { ..._exportable_pubKey };
  //         }
  //         if (sbCrypto.areKeysSame(_exportable_verifiedGuest_pubKey, _exportable_pubKey)) {
  //           isVerifiedGuest = true;
  //         }
  //       }

  //       const _encryption_key: CryptoKey = await sbCrypto.importKey('jwk', _exportable_encryption_key, 'AES', false, ['encrypt', 'decrypt']);

  //       const _room_privateSignKey: CryptoKey = await sbCrypto.importKey('jwk', _exportable_room_signKey, 'ECDH', true, ['deriveKey']);
  //       const _exportable_room_signPubKey: JsonWebKey | null = sbCrypto.extractPubKey(_exportable_room_signKey);

  //       const _room_signPubKey: CryptoKey = await sbCrypto.importKey('jwk', _exportable_room_signPubKey!, 'ECDH', true, []);
  //       const _personal_signKey: CryptoKey = await sbCrypto.deriveKey(_privateKey, _room_signPubKey, 'HMAC', false, ['sign', 'verify']);
  //       let _shared_key: CryptoKey | null;

  //       if (!isOwner) {
  //         _shared_key = await sbCrypto.deriveKey(_privateKey, _owner_pubKey, 'AES', false, ['encrypt', 'decrypt']);
  //       }

  //       let _locked_key
  //       // if (process.browser) {
  //       let _exportable_locked_key: string | null = await _localStorage.getItem(this.channel_id + '_lockedKey');
  //       // } else {
  //       //   _exportable_locked_key = await _localStorage.getItem(this._id + '_lockedKey');
  //       // }
  //       if (_exportable_locked_key !== null) {
  //         _locked_key = await sbCrypto.importKey('jwk', jsonParseWrapper(_exportable_locked_key, 'L1517'), 'AES', false, ['encrypt', 'decrypt']);
  //       } else if (keys.locked_key) {
  //         const _string_locked_key: string = await sbCrypto.decrypt(isOwner ? await sbCrypto.deriveKey(keys.privateKey, await sbCrypto.importKey('jwk', keys.exportable_pubKey, 'ECDH', true, []), 'AES', false, ['decrypt']) : _shared_key!, jsonParseWrapper(keys.locked_key, 'L1519'), 'string');
  //         _exportable_locked_key = jsonParseWrapper(_string_locked_key, 'L1520');
  //         _locked_key = await sbCrypto.importKey('jwk', jsonParseWrapper(_exportable_locked_key!, 'L1521'), 'AES', false, ['encrypt', 'decrypt']);
  //       }

  //       this.#keys = {
  //         shared_key: _shared_key!,
  //         exportable_owner_pubKey: _exportable_owner_pubKey,
  //         exportable_verifiedGuest_pubKey: _exportable_verifiedGuest_pubKey,
  //         personal_signKey: _personal_signKey,
  //         room_privateSignKey: _room_privateSignKey,
  //         encryptionKey: _encryption_key,
  //         locked_key: _locked_key,
  //         exportable_locked_key: _exportable_locked_key
  //       };
  //       this.owner = isOwner;
  //       this.admin = isAdmin;
  //       this.verifiedGuest = isVerifiedGuest;
  //       resolve(true);
  //     });
  //   };


  /**
   * asImage
   */
  #asImage(image: File, signKey: CryptoKey) {
    // TODO: the getfile/restrict should be done by SBImage etc, other stuff is SB messaging
    throw new Error(`#asImage() needs carryover from SBImage etc (${image}, ${signKey})`)

    // this.data.previewImage = this.#padImage(await (await this.#restrictPhoto(image, 4096, 'image/jpeg', 0.92)).arrayBuffer());
    // const previewHash: Dictionary = await this.#generateImageHash(this.data.previewImage);
    // this.data.fullImage = image.byteLength > 15728640 ? this.#padImage(await (await this.#restrictPhoto(image, 15360, 'image/jpeg', 0.92)).arrayBuffer()) : this.#padImage(image);
    // const fullHash: Dictionary = await this.#generateImageHash(this.data.fullImage);
    // this.image = await this.#getFileData(await this.#restrictPhoto(image, 15, 'image/jpeg', 0.92), 'url');
    // this.image_sign = await sbCrypto.sign(signKey, this.image);
    // this.imageMetaData = JSON.stringify({
    //   imageId: fullHash.id,
    //   previewId: previewHash.id,
    //   imageKey: fullHash.key,
    //   previewKey: previewHash.key
    // });
    // this.imageMetadata_sign = await sbCrypto.sign(signKey, this.imageMetaData)
  }

  /**
   * getFileData
   */
  // disabled for now, used to laod files etc
  // #getFileData(file: File, outputType: string | ArrayBuffer) {
  //   try {
  //     const reader = new FileReader();
  //     if (file.size === 0) {
  //       return null;
  //     }
  //     outputType === 'url' ? reader.readAsDataURL(file) : reader.readAsArrayBuffer(file);
  //     return new Promise((resolve) => {
  //       reader.onloadend = () => {
  //         const the_blob = reader.result;
  //         resolve(the_blob);
  //       };
  //     });
  //   } catch (e) {
  //     console.log(e);
  //     return null;
  //   }
  // }


  //   /**
  //    * scaleCanvas
  //    */
  //   #scaleCanvas(canvas: HTMLCanvasElement, scale: number) {
  //     // latest and greatest JS version is in:
  //     // 384-snackabra-webclient/src/utils/ImageProcessor.js
  //     throw new Error('scaleCanvas() needs TS version')

  //     const scaledCanvas: HTMLCanvasElement = document.createElement('canvas');
  //     scaledCanvas.width = canvas.width * scale;
  //     scaledCanvas.height = canvas.height * scale;
  //     // console.log(`#### scaledCanvas target W ${scaledCanvas.width} x H ${scaledCanvas.height}`);
  //     scaledCanvas!
  //       .getContext('2d')!
  //       .drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
  //     // console.log(`#### scaledCanvas actual W ${scaledCanvas.width} x H ${scaledCanvas.height}`);
  //     return scaledCanvas;
  //   }

  //   /**
  //    * generateImageHash
  //    */
  //   async #generateImageHash(image: ArrayBuffer): Promise<{ id: string, key: string } | {}> {
  //     // latest and greatest JS version is in:
  //     // 384-snackabra-webclient/src/utils/ImageProcessor.js
  //     throw new Error('generateImageHash() needs TS version')
  //   }

  //   /**
  //    * readPhoto
  //    */
  //   async #readPhoto(photo: ImageData) {
  //     const canvas: HTMLCanvasElement = document.createElement('canvas');
  //     const img: HTMLImageElement = document.createElement('img');

  //     // create img element from File object
  //     img.src = await new Promise((resolve) => {
  //       const reader = new FileReader();
  //       // TODO: the entire readPhoto stuff is replaced by SBImage
  //       // @ts-ignore
  //       reader.onload = (e) => resolve(e.target?.result);
  //       // TODO: ditto
  //       // @ts-ignore
  //       reader.readAsDataURL(photo);
  //     });
  //     await new Promise((resolve) => {
  //       img.onload = resolve;
  //     });

  //     // console.log("img object");
  //     // console.log(img);
  //     // console.log("canvas object");
  //     // console.log(canvas);

  //     // draw image in canvas element
  //     canvas.width = img.width
  //     canvas.height = img.height
  //     canvas!.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
  //     return canvas
  //   }

} /* SBFile */





// // TODO: keep adding message type
// // TODO: processing this:


//   const _exportable_room_signKey: JsonWebKey = jsonParseWrapper(keys.signKey, 'L1470');
//   const _exportable_encryption_key: JsonWebKey = jsonParseWrapper(keys.encryptionKey, 'L1471');
 //   let _exportable_verifiedGuest_pubKey: JsonWebKey = jsonParseWrapper(keys.guestKey || null, 'L1472');
//   const _exportable_pubKey: JsonWebKey = await _self.defaultIdentity!.exportable_pubKey.then();
//   const _privateKey: CryptoKey = await _self.defaultIdentity!.privateKey.then();
//   let isVerifiedGuest = false;
//   const _owner_pubKey = await sbCrypto.importKey('jwk', _exportable_owner_pubKey, 'ECDH', false, []);
//   const isOwner = sbCrypto.areKeysSame(_exportable_pubKey, _exportable_owner_pubKey);

//   // TODO: this handles the cookie/admin mechanism from an SSO
//   // BROWSER

//   // hardcoded to only trust cookies from 'privacy.app' SSO (MI):
//   // const isAdmin: boolean = (document.cookie.split('; ').find((row: string) =>
//   //     row.startsWith('token_' + this._id)) !== undefined) || (this.url !== 'https://s_socket.privacy.app' && isOwner);
//   // NODE? not sure what fallback this is:
//   //   const isAdmin: boolean = (this.url !== 'https://s_socket.privacy.app' && isOwner);
//   // and this might be local dev override?
//   //   const isAdmin = (process.env.REACT_APP_ROOM_SERVER !== 's_socket.privacy.app' && isOwner);

//   // for now disabled feature (TODO this is for SSO support which adds an 'admin' status)
//   const isAdmin: boolean = false

//   if (!isOwner && !isAdmin) {
//     if (_exportable_verifiedGuest_pubKey === null) {
//       this.api.postPubKey(_exportable_pubKey);
//       _exportable_verifiedGuest_pubKey = { ..._exportable_pubKey };
//     }
//     if (sbCrypto.areKeysSame(_exportable_verifiedGuest_pubKey, _exportable_pubKey)) {
//       isVerifiedGuest = true;
//     }
//   }

//   const _encryption_key: CryptoKey = await sbCrypto.importKey('jwk', _exportable_encryption_key, 'AES', false, ['encrypt', 'decrypt']);

//   const _room_privateSignKey: CryptoKey = await sbCrypto.importKey('jwk', _exportable_room_signKey, 'ECDH', true, ['deriveKey']);
//   const _exportable_room_signPubKey: JsonWebKey | null = sbCrypto.extractPubKey(_exportable_room_signKey);

//   const _room_signPubKey: CryptoKey = await sbCrypto.importKey('jwk', _exportable_room_signPubKey!, 'ECDH', true, []);
//   const _personal_signKey: CryptoKey = await sbCrypto.deriveKey(_privateKey, _room_signPubKey, 'HMAC', false, ['sign', 'verify']);

//   let _shared_key: CryptoKey | null;

//   if (!isOwner) {
//     _shared_key = await sbCrypto.deriveKey(_privateKey, _owner_pubKey, 'AES', false, ['encrypt', 'decrypt']);
//   }

//   let _locked_key
//   // if (process.browser) {
//   let _exportable_locked_key: string | null = await _localStorage.getItem(this.channel_id + '_lockedKey');
//   // } else {
//   //   _exportable_locked_key = await _localStorage.getItem(this._id + '_lockedKey');
//   // }
//   if (_exportable_locked_key !== null) {
//     _locked_key = await sbCrypto.importKey('jwk', jsonParseWrapper(_exportable_locked_key, 'L1517'), 'AES', false, ['encrypt', 'decrypt']);
//   } else if (keys.locked_key) {
//     const _string_locked_key: string = await sbCrypto.decrypt(isOwner ? await sbCrypto.deriveKey(keys.privateKey, await sbCrypto.importKey('jwk', keys.exportable_pubKey, 'ECDH', true, []), 'AES', false, ['decrypt']) : _shared_key!, jsonParseWrapper(keys.locked_key, 'L1519'), 'string');
//     _exportable_locked_key = jsonParseWrapper(_string_locked_key, 'L1520');
//     _locked_key = await sbCrypto.importKey('jwk', jsonParseWrapper(_exportable_locked_key!, 'L1521'), 'AES', false, ['encrypt', 'decrypt']);
//   }

//   this.#keys = {
//     shared_key: _shared_key!,
//     exportable_owner_pubKey: _exportable_owner_pubKey,
//     exportable_verifiedGuest_pubKey: _exportable_verifiedGuest_pubKey,
//     personal_signKey: _personal_signKey,
//     room_privateSignKey: _room_privateSignKey,
//     encryptionKey: _encryption_key,
//     locked_key: _locked_key,
//     exportable_locked_key: _exportable_locked_key
//   };
//   this.owner = isOwner;
//   this.admin = isAdmin;
//   this.verifiedGuest = isVerifiedGuest;
//   resolve(true);
// });


/* 
  */

/* **************************************************************** */
/* **************** OLD and for archive **************** */
/* **************************************************************** */


  // psm: this is no longer global
  // /** Snackabra.setIdentity()
  //     @param {JsonWebKey} sets public key (identity) you're joining channel with
  //  */
  // setIdentity(keys: JsonWebKey) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       await this.#identity.mountKeys(keys);
  //       resolve(this.#identity);
  //     } catch (e) {
  //       reject(e);
  //     }
  //   });
  // }

  // /** Snackabra.createIdentity
  //     Creates a random (new) identity
  //  */
  // createIdentity() {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       this.#identity = await new Identity();
  //       resolve(this.#identity);
  //     } catch (e) {
  //       reject(e);
  //     }
  //   });
  // }




// /**
//  * mtg: Protocol code that we wrap our WebSocket in
//  * I will be updating this to send messages and remove
//  * the wait to send messages only when ack received
//  * The benefit is reduced latency in communication protocol
//  */
// class WS_Protocol {
//   currentWebSocket!: WebSocket;
//   _id!: string;
//   events = new MessageBus();
//   #options: WSProtocolOptions = {
//     url: '', onOpen: null, onMessage: null, onClose: null, onError: null, timeout: 30000
//   };

//   constructor(options: WSProtocolOptions) {
//     if (!options.url) {
//       throw new Error('URL must be set');
//     }
//     this.#options = Object.assign(this.options, options);
//     this.join();
//   }

//   /**
//    * WS_Protocol
//    * Get options
//    */
//   get options() {
//     return this.#options;
//   }

//   /**
//    * WS_Protocol
//    * join
//    */
//   join(): Promise<boolean> {
//     return new Promise((resolve, reject) => {
//       try {
//         this.currentWebSocket = new WebSocket(this.options.url);
//         this.onError();
//         this.onClose();
//         this.onOpen();
//         this.onMessage();
//         resolve(true);
//       } catch (e) {
//         console.error(e);
//         reject(e);
//       }
//     });
//   }

//   /**
//    * WS_Protocol
//    * close
//    */
//   close() {
//     this.currentWebSocket.close();
//   }

//   send = (message: string): Promise<boolean> => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         if (this.currentWebSocket.readyState === 1) {
//           const hash = await crypto.subtle
//             .digest('SHA-256', new TextEncoder().encode(message));
//           const ackPayload = {
//             timestamp: Date.now(), type: 'ack', _id: arrayBufferToBase64(hash)
//           };
//           this.currentWebSocket.send(message);
// 	  // TODO: update protocol so server acks on message
//           this.currentWebSocket.send(JSON.stringify(ackPayload));

//           const timeout = setTimeout(() => {
//             const error = `Websocket request timed out after ${this.options.timeout}ms`;
//             console.error(error, 'ws_ack_' + ackPayload._id);
//             reject(new Error(error));
//           }, this.options.timeout);

//           const ackResponse = () => {
//             clearTimeout(timeout);
//             this.events.unsubscribe('ws_ack_' + ackPayload._id, ackResponse);
//             resolve(true);
//           };

//           this.events.subscribe('ws_ack_' + ackPayload._id, ackResponse);
//         }
//       } catch (e) {
//         console.error(e);
//       }
//     });
//   };

//   /**
//    * WS_Protocol
//    * onMessage
//    */
//   onMessage() {
//     this.currentWebSocket.addEventListener('message', (event) => {
//       const data = jsonParseWrapper(event.data, 'L1342');
//       // console.log(data)

//       dispatchMessage(data)

//       if (data.ack) {
//         this.events.publish('ws_ack_' + data._id);
//         return;
//       }
//       if (data.nack) {
//         console.error('Nack received');
//         this.close();
//         return;
//       }
//       if (typeof this.options.onMessage === 'function') {
//         this.options.onMessage(data);
//       }
//     });
//   }

//   /**
//    * WS_Protocol
//    * readyState
//    */
//   get readyState() {
//     return this.currentWebSocket.readyState;
//   }

//   /**
//    * WS_Protocol
//    * onOpen
//    */
//   onOpen() {
//     this.currentWebSocket.addEventListener('open', (event) => {
//       if (typeof this.options.onOpen === 'function') {
//         this.options.onOpen(event);
//       }
//     });
//   }
// }


// psm: replacing this old stuff ...
// interface ChannelKeys {
//   exportable_owner_pubKey: CryptoKey;
//   exportable_verifiedGuest_pubKey: CryptoKey;
//   personal_signKey: CryptoKey;
//   room_privateSignKey: CryptoKey;
//   encryptionKey: CryptoKey;
//   locked_key: CryptoKey;
//   shared_key: CryptoKey;
//   exportable_locked_key: Dictionary;
// }


// export {
//   Snackabra,
//   SBMessage,
//   SBFile,
//   SB_libraryVersion,
//   ab2str,
//   str2ab,
//   base64ToArrayBuffer,
//   arrayBufferToBase64,
//   getRandomValues
// };



// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************


// 20221014 - abstract class refactor of Channel / ChannelSocket

  /**
   * Channel.send()
   */
  // send(m: SBMessage) {
  //   return(this.#socket.send(m))
  // }

  // set onMessage(f: CallableFunction) {
  //   this.#socket.onMessage = f
  // }

  // /**
  //  * Channel.join()
  //  */
  // join(channel_id: string): Promise<Channel> {
  // }

  /**
   * Channel.keys()
   *
   * Return keys used on socket
   */
  // get keys(): ChannelKeys {
  //   _sb_assert(this.#socket, "Channel.keys(): no socket (!)")
  //   return this.#socket.keys
// }


  /**
   * Channel.socket()
   */
  // get socket() {
  //   return this.#socket;
  // }



"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.derivePairingCodeKey = exports.hkdf = exports.md5 = exports.sha256 = exports.hmacSign = exports.aesEncrypWithIV = exports.aesEncrypt = exports.aesDecryptWithIV = exports.aesDecrypt = exports.aesDecryptCTR = exports.aesEncryptCTR = exports.aesDecryptGCM = exports.aesEncryptGCM = exports.signedKeyPair = exports.Curve = exports.generateSignalPubKey = void 0;
const crypto_1 = require("crypto");
const libsignal = __importStar(require("libsignal"));
const Defaults_1 = require("../Defaults");
/** prefix version byte to the pub keys, required for some curve crypto functions */
const generateSignalPubKey = (pubKey) => (pubKey.length === 33
    ? pubKey
    : Buffer.concat([Defaults_1.KEY_BUNDLE_TYPE, pubKey]));
exports.generateSignalPubKey = generateSignalPubKey;
exports.Curve = {
    generateKeyPair: () => {
        const { pubKey, privKey } = libsignal.curve.generateKeyPair();
        return {
            private: Buffer.from(privKey),
            // remove version byte
            public: Buffer.from(pubKey.slice(1))
        };
    },
    sharedKey: (privateKey, publicKey) => {
        const shared = libsignal.curve.calculateAgreement((0, exports.generateSignalPubKey)(publicKey), privateKey);
        return Buffer.from(shared);
    },
    sign: (privateKey, buf) => (libsignal.curve.calculateSignature(privateKey, buf)),
    verify: (pubKey, message, signature) => {
        try {
            libsignal.curve.verifySignature((0, exports.generateSignalPubKey)(pubKey), message, signature);
            return true;
        }
        catch (error) {
            return false;
        }
    }
};
const signedKeyPair = (identityKeyPair, keyId) => {
    const preKey = exports.Curve.generateKeyPair();
    const pubKey = (0, exports.generateSignalPubKey)(preKey.public);
    const signature = exports.Curve.sign(identityKeyPair.private, pubKey);
    return { keyPair: preKey, signature, keyId };
};
exports.signedKeyPair = signedKeyPair;
const GCM_TAG_LENGTH = 128 >> 3;
/**
 * encrypt AES 256 GCM;
 * where the tag tag is suffixed to the ciphertext
 * */
function aesEncryptGCM(plaintext, key, iv, additionalData) {
    const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', key, iv);
    cipher.setAAD(additionalData);
    return Buffer.concat([cipher.update(plaintext), cipher.final(), cipher.getAuthTag()]);
}
exports.aesEncryptGCM = aesEncryptGCM;
/**
 * decrypt AES 256 GCM;
 * where the auth tag is suffixed to the ciphertext
 * */
function aesDecryptGCM(ciphertext, key, iv, additionalData) {
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', key, iv);
    // decrypt additional adata
    const enc = ciphertext.slice(0, ciphertext.length - GCM_TAG_LENGTH);
    const tag = ciphertext.slice(ciphertext.length - GCM_TAG_LENGTH);
    // set additional data
    decipher.setAAD(additionalData);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]);
}
exports.aesDecryptGCM = aesDecryptGCM;
function aesEncryptCTR(plaintext, key, iv) {
    const cipher = (0, crypto_1.createCipheriv)('aes-256-ctr', key, iv);
    return Buffer.concat([cipher.update(plaintext), cipher.final()]);
}
exports.aesEncryptCTR = aesEncryptCTR;
function aesDecryptCTR(ciphertext, key, iv) {
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-ctr', key, iv);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
exports.aesDecryptCTR = aesDecryptCTR;
/** decrypt AES 256 CBC; where the IV is prefixed to the buffer */
function aesDecrypt(buffer, key) {
    return aesDecryptWithIV(buffer.slice(16, buffer.length), key, buffer.slice(0, 16));
}
exports.aesDecrypt = aesDecrypt;
/** decrypt AES 256 CBC */
function aesDecryptWithIV(buffer, key, IV) {
    const aes = (0, crypto_1.createDecipheriv)('aes-256-cbc', key, IV);
    return Buffer.concat([aes.update(buffer), aes.final()]);
}
exports.aesDecryptWithIV = aesDecryptWithIV;
// encrypt AES 256 CBC; where a random IV is prefixed to the buffer
function aesEncrypt(buffer, key) {
    const IV = (0, crypto_1.randomBytes)(16);
    const aes = (0, crypto_1.createCipheriv)('aes-256-cbc', key, IV);
    return Buffer.concat([IV, aes.update(buffer), aes.final()]); // prefix IV to the buffer
}
exports.aesEncrypt = aesEncrypt;
// encrypt AES 256 CBC with a given IV
function aesEncrypWithIV(buffer, key, IV) {
    const aes = (0, crypto_1.createCipheriv)('aes-256-cbc', key, IV);
    return Buffer.concat([aes.update(buffer), aes.final()]); // prefix IV to the buffer
}
exports.aesEncrypWithIV = aesEncrypWithIV;
// sign HMAC using SHA 256
function hmacSign(buffer, key, variant = 'sha256') {
    return (0, crypto_1.createHmac)(variant, key).update(buffer).digest();
}
exports.hmacSign = hmacSign;
function sha256(buffer) {
    return (0, crypto_1.createHash)('sha256').update(buffer).digest();
}
exports.sha256 = sha256;
function md5(buffer) {
    return (0, crypto_1.createHash)('md5').update(buffer).digest();
}
exports.md5 = md5;
// HKDF key expansion
async function hkdf(buffer, expandedLength, info) {
    // Ensure we have a Uint8Array for the key material
    const inputKeyMaterial = buffer instanceof Uint8Array
        ? buffer
        : new Uint8Array(buffer);
    // Set default values if not provided
    const salt = info.salt ? new Uint8Array(info.salt) : new Uint8Array(0);
    const infoBytes = info.info
        ? new TextEncoder().encode(info.info)
        : new Uint8Array(0);
    // Import the input key material
    const importedKey = await crypto.subtle.importKey('raw', inputKeyMaterial, { name: 'HKDF' }, false, ['deriveBits']);
    // Derive bits using HKDF
    const derivedBits = await crypto.subtle.deriveBits({
        name: 'HKDF',
        hash: 'SHA-256',
        salt: salt,
        info: infoBytes
    }, importedKey, expandedLength * 8 // Convert bytes to bits
    );
    return Buffer.from(derivedBits);
}
exports.hkdf = hkdf;
async function derivePairingCodeKey(pairingCode, salt) {
    // Convert inputs to formats Web Crypto API can work with
    const encoder = new TextEncoder();
    const pairingCodeBuffer = encoder.encode(pairingCode);
    const saltBuffer = salt instanceof Uint8Array ? salt : new Uint8Array(salt);
    // Import the pairing code as key material
    const keyMaterial = await crypto.subtle.importKey('raw', pairingCodeBuffer, { name: 'PBKDF2' }, false, ['deriveBits']);
    // Derive bits using PBKDF2 with the same parameters
    // 2 << 16 = 131,072 iterations
    const derivedBits = await crypto.subtle.deriveBits({
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 2 << 16,
        hash: 'SHA-256'
    }, keyMaterial, 32 * 8 // 32 bytes * 8 = 256 bits
    );
    return Buffer.from(derivedBits);
}
exports.derivePairingCodeKey = derivePairingCodeKey;

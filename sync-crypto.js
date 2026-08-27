(function (root, factory) {
    const api = factory(root.crypto);
    if (typeof module === 'object' && module.exports) module.exports = api;
    root.MagicSyncCrypto = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function (webCrypto) {
    'use strict';

    const FORMAT = 'api-magic-book-encrypted';
    const VERSION = 1;
    const PBKDF2_ITERATIONS = 600000;
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();

    function requireCrypto() {
        if (!webCrypto?.subtle || !webCrypto?.getRandomValues) {
            throw new Error('当前浏览器不支持安全加密，请升级浏览器后再同步。');
        }
        return webCrypto;
    }

    function bytesToBase64(bytes) {
        let binary = '';
        const chunkSize = 0x8000;
        for (let offset = 0; offset < bytes.length; offset += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
        }
        if (typeof btoa === 'function') return btoa(binary);
        return Buffer.from(binary, 'binary').toString('base64');
    }

    function base64ToBytes(value) {
        const binary = typeof atob === 'function'
            ? atob(value)
            : Buffer.from(value, 'base64').toString('binary');
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
            bytes[index] = binary.charCodeAt(index);
        }
        return bytes;
    }

    async function deriveEncryptionKey(password, salt, iterations) {
        const cryptoApi = requireCrypto();
        const passwordKey = await cryptoApi.subtle.importKey(
            'raw',
            textEncoder.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );
        return cryptoApi.subtle.deriveKey(
            {
                name: 'PBKDF2',
                hash: 'SHA-256',
                salt,
                iterations
            },
            passwordKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    function isEncryptedPayload(value) {
        return Boolean(
            value
            && value.format === FORMAT
            && value.version === VERSION
            && value.kdf?.name === 'PBKDF2'
            && value.kdf?.hash === 'SHA-256'
            && value.cipher?.name === 'AES-GCM'
            && typeof value.kdf?.salt === 'string'
            && typeof value.cipher?.iv === 'string'
            && typeof value.ciphertext === 'string'
        );
    }

    async function encryptJson(value, password) {
        if (!password) throw new Error('请输入同步密码。');
        const cryptoApi = requireCrypto();
        const salt = cryptoApi.getRandomValues(new Uint8Array(16));
        const iv = cryptoApi.getRandomValues(new Uint8Array(12));
        const key = await deriveEncryptionKey(password, salt, PBKDF2_ITERATIONS);
        const additionalData = textEncoder.encode(`${FORMAT}:v${VERSION}`);
        const plaintext = textEncoder.encode(JSON.stringify(value));
        const encrypted = await cryptoApi.subtle.encrypt(
            { name: 'AES-GCM', iv, additionalData, tagLength: 128 },
            key,
            plaintext
        );

        return {
            format: FORMAT,
            version: VERSION,
            kdf: {
                name: 'PBKDF2',
                hash: 'SHA-256',
                iterations: PBKDF2_ITERATIONS,
                salt: bytesToBase64(salt)
            },
            cipher: {
                name: 'AES-GCM',
                keyLength: 256,
                tagLength: 128,
                iv: bytesToBase64(iv)
            },
            ciphertext: bytesToBase64(new Uint8Array(encrypted))
        };
    }

    async function decryptJson(payload, password) {
        if (!password) throw new Error('请输入同步密码。');
        if (!isEncryptedPayload(payload)) throw new Error('云端书库不是受支持的加密格式。');
        if (payload.kdf.iterations !== PBKDF2_ITERATIONS) {
            throw new Error('云端书库使用了不受支持的加密参数。');
        }

        try {
            const cryptoApi = requireCrypto();
            const salt = base64ToBytes(payload.kdf.salt);
            const iv = base64ToBytes(payload.cipher.iv);
            if (salt.length !== 16 || iv.length !== 12) throw new Error('invalid parameters');
            const key = await deriveEncryptionKey(password, salt, payload.kdf.iterations);
            const additionalData = textEncoder.encode(`${FORMAT}:v${VERSION}`);
            const decrypted = await cryptoApi.subtle.decrypt(
                { name: 'AES-GCM', iv, additionalData, tagLength: 128 },
                key,
                base64ToBytes(payload.ciphertext)
            );
            return JSON.parse(textDecoder.decode(decrypted));
        } catch (_) {
            throw new Error('同步密码不正确，或云端数据已经损坏。');
        }
    }

    return {
        FORMAT,
        VERSION,
        PBKDF2_ITERATIONS,
        encryptJson,
        decryptJson,
        isEncryptedPayload
    };
});

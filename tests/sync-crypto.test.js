const test = require('node:test');
const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');

globalThis.crypto = webcrypto;
const {
    encryptJson,
    decryptJson,
    isEncryptedPayload,
    PBKDF2_ITERATIONS
} = require('../sync-crypto.js');

const sampleApis = [
    {
        name: '云朵站点',
        category: '普通',
        url: 'https://example.com/v1',
        key: 'sk-example-only',
        starred: true
    }
];

test('加密后可以用相同密码完整解密中文数据', async () => {
    const encrypted = await encryptJson(sampleApis, '只在测试里使用的同步密码');
    assert.equal(isEncryptedPayload(encrypted), true);
    assert.equal(encrypted.kdf.iterations, PBKDF2_ITERATIONS);
    assert.deepEqual(await decryptJson(encrypted, '只在测试里使用的同步密码'), sampleApis);
});

test('相同内容每次加密都会生成不同密文', async () => {
    const first = await encryptJson(sampleApis, '只在测试里使用的同步密码');
    const second = await encryptJson(sampleApis, '只在测试里使用的同步密码');
    assert.notEqual(first.kdf.salt, second.kdf.salt);
    assert.notEqual(first.cipher.iv, second.cipher.iv);
    assert.notEqual(first.ciphertext, second.ciphertext);
});

test('错误密码不能解密且不会返回任何数据', async () => {
    const encrypted = await encryptJson(sampleApis, '正确的同步密码');
    await assert.rejects(
        decryptJson(encrypted, '错误的同步密码'),
        /同步密码不正确/
    );
});

test('密文被修改后会拒绝解密', async () => {
    const encrypted = await encryptJson(sampleApis, '只在测试里使用的同步密码');
    const tampered = {
        ...encrypted,
        ciphertext: `${encrypted.ciphertext.slice(0, -2)}AA`
    };
    await assert.rejects(
        decryptJson(tampered, '只在测试里使用的同步密码'),
        /同步密码不正确|已经损坏/
    );
});

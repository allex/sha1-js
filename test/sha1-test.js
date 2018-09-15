const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const nativeSha1 = (data, digest = 'hex') => crypto.createHash('sha1').update(data).digest(digest);
const sha1 = require('../').sha1;

const testBinaryFile = path.resolve(__dirname, 'files', 'me.png')
const arrayBuffer = fs.readFileSync(testBinaryFile);

describe('use native to test', () => {
  test('sha1() with string, arraybuffer', () => {
    expect(nativeSha1('allex')).toBe('d9e871f42129614cfd86c25de8b1ebd210f9e875');
    expect(nativeSha1(arrayBuffer)).toBe('90e76e1a337cd9e9bb9b33ed834ae2a05b069685');
  });
});

describe('use pure js sha1-js to test', () => {
  test('sha1() with string, arraybuffer', () => {
    expect(sha1('allex')).toBe('d9e871f42129614cfd86c25de8b1ebd210f9e875');
    expect(sha1(arrayBuffer)).toBe('90e76e1a337cd9e9bb9b33ed834ae2a05b069685');
  });
});

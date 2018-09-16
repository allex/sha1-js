# sha1

Sha1 implements with pure js. supports string, Buffer, ArrayBuffer, Uint8Array

## Usage

```sh
yarn add @allex/sha1 -D
```

```js
import { sha1 } from '@allex/sha1'

const testBinaryFile = path.resolve(__dirname, 'files', 'me.png')
const arrayBuffer = fs.readFileSync(testBinaryFile);

describe('use pure js sha1.js to test', () => {
  test('sha1() with string, arraybuffer', () => {
    expect(sha1('allex')).toBe('d9e871f42129614cfd86c25de8b1ebd210f9e875');
    expect(sha1(arrayBuffer)).toBe('90e76e1a337cd9e9bb9b33ed834ae2a05b069685');
  });
});
```

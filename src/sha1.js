/**
 * Sha1 implements with pure js. supports string, Buffer, ArrayBuffer, Uint8Array
 *
 * @author Allex Wang (allex.wxn@gmail.com) <http://fedor.io/>
 * MIT Licensed
 */

const HEX_CHARS = '0123456789abcdef'.split('');

/*
 Add integers, wrapping at 2^32. This uses 16-bit operations internally
 to work around bugs in some JS interpreters.
 */
const safeAdd = (x, y) => {
  const lsw = (x & 0xFFFF) + (y & 0xFFFF);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
};

/**
 * The SHA-1 logical functions f(0), f(1), ..., f(79).
 * Perform the appropriate triplet combination function for the current iteration
 * @private
 */
const _f = (s, x, y, z) => {
  switch (s) {
    case 0: return (x & y) ^ (~x & z); // Ch()
    case 1: return x ^ y ^ z; // Parity()
    case 2: return (x & y) ^ (x & z) ^ (y & z); // Maj()
    case 3:
    default: return x ^ y ^ z; // Parity()
  }
};

/**
 * Rotates left (circular left shift) value x by n positions [§3.2.5].
 * @private
 */
const ROTL = (x, n) => {
  return (x << n) | (x >>> (32 - n));
};

/*
 Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
const calcHash = blockArray => {
  const x = blockArray; // append padding
  const W = Array(80);

  // constants [§4.2.1]
  const K = [ 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6 ];

  // initial hash value [§5.3.1]
  const H = [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0 ];

  // HASH COMPUTATION [§6.1.2]
  // (use JavaScript '>>> 0' to emulate UInt32 variables)

  for (let i = 0, N = x.length; i < N; i += 16) {
    // 1 - initialise five working variables a, b, c, d, e with previous hash value
    let [ a, b, c, d, e ] = H;

    // 2 - main loop
    for (let t = 0; t < 80; t += 1) {
      const s = (t / 20) >> 0; // seq for blocks of 'f' functions and 'K' constants

      // prepare message schedule 'W'
      if (t < 16) {
        W[t] = x[i + t];
      } else {
        W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1) >>> 0;
      }

      // W[t]: Determine the appropriate additive constant for the current iteration
      const T = safeAdd(safeAdd(ROTL(a, 5), _f(s, b, c, d)), safeAdd(safeAdd(e, W[t]), K[s]));
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }

    // 3 - compute the new intermediate hash value (note 'addition modulo 2^32' – JavaScript
    // '>>> 0' coerces to unsigned UInt32 which achieves modulo 2^32 addition)
    H[0] = safeAdd(H[0] + a) >>> 0;
    H[1] = safeAdd(H[1] + b) >>> 0;
    H[2] = safeAdd(H[2] + c) >>> 0;
    H[3] = safeAdd(H[3] + d) >>> 0;
    H[4] = safeAdd(H[4] + e) >>> 0;
  }

  return H;
};

/*
 The standard SHA1 needs the input buffer to fit into a block
 This function align the input string to meet the requirement
 */
const alignSHA1 = buffer => {
  const l = buffer.length,
    nblk = ((l + 8) >> 6) + 1,
    blks = new Array(nblk * 16);
  let i = 0;
  for (i = 0; i < nblk * 16; i += 1) {
    blks[i] = 0;
  }
  for (i = 0; i < l; i += 1) {
    blks[i >> 2] |= buffer[i] << (24 - (i & 3) * 8);
  }
  blks[i >> 2] |= 0x80 << (24 - (i & 3) * 8);
  blks[nblk * 16 - 1] = l * 8;
  return blks;
};

/*
 Convert H0..H4 of big-endian words to hex strings (with leading zeros)
 */
const binb2hex = H => {
  const chars = HEX_CHARS;
  let str = '';
  for (let i = 0, l = H.length * 4; i < l; i += 1) {
    str += chars[(H[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF] + chars[(H[i >> 2] >> ((3 - i % 4) * 8)) & 0xF];
  }
  return str;
};

/*
 The main function to calculate message digest
 */
const sha1 = s => {
  if (typeof s !== 'string') {
    if (isInstance(s, ArrayBuffer) ||
      (s && isInstance(s.buffer, ArrayBuffer))) {
      s = fromArrayBuffer(s);
    }
  } else {
    s = str2utf8b(s);
  }
  return binb2hex(calcHash(alignSHA1(s)));
};

function fromArrayBuffer(array) {
  const buf = new Uint8Array(array);
  return buf;
}

function str2utf8b(str) {
  const binstr = unescape(encodeURIComponent(str)), // monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
    arr = new Uint8Array(binstr.length),
    split = binstr.split('');
  let l = split.length;
  while (l--) {
    arr[l] = split[l].charCodeAt(0);
  }
  return arr;
}

function isInstance(obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name);
}

export { sha1 };

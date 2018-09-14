/**
 * Sha1 implements with pure js. support string, Uint8Array, BuffArray
 *
 * @author Allex Wang (allex.wxn@gmail.com) <http://fedor.io/>
 * MIT Licensed
 */

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
const _f = (t, b, c, d) => {
  if (t < 20) {
    return (b & c) | ((~b) & d);
  } else if (t < 40) {
    return b ^ c ^ d;
  } else if (t < 60) {
    return (b & c) | (b & d) | (c & d);
  }
  return b ^ c ^ d; // t<80
};

/*
 Determine the appropriate additive constant for the current iteration
 */
const sha1Kt = t => (
  (t < 20)
    ? 1518500249
    : (t < 40)
      ? 1859775393
      : (t < 60)
        ? -1894007588
        : -899497514);

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
  const w = Array(80);

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;
  let e = -1009589776;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;
    const olde = e;
    for (let j = 0; j < 80; j += 1) {
      if (j < 16) {
        w[j] = x[i + j];
      } else {
        w[j] = ROTL(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
      }
      const t = safeAdd(
        safeAdd(ROTL(a, 5), _f(j, b, c, d)),
        safeAdd(safeAdd(e, w[j]), sha1Kt(j))
      );
      e = d;
      d = c;
      c = ROTL(b, 30);
      b = a;
      a = t;
    }
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
    e = safeAdd(e, olde);
  }
  return [ a, b, c, d, e ];
};


/*
 The standard SHA1 needs the input string to fit into a block
 This function align the input string to meet the requirement
 */
const alignSHA1 = str => {
  const nblk = ((str.length + 8) >> 6) + 1;
  const blks = new Array(nblk * 16);
  let i = 0;
  for (i = 0; i < nblk * 16; i += 1) {
    blks[i] = 0;
  }
  for (i = 0; i < str.length; i += 1) {
    blks[i >> 2] |= str.charCodeAt(i) << (24 - (i & 3) * 8);
  }
  blks[i >> 2] |= 0x80 << (24 - (i & 3) * 8);
  blks[nblk * 16 - 1] = str.length * 8;
  return blks;
};

/*
 Convert an array of big-endian words to a hex string.
 */
const binb2hex = binarray => {
  const hexTab = '0123456789abcdef';
  let str = '';
  for (let i = 0; i < binarray.length * 4; i += 1) {
    str += hexTab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) + hexTab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
  }
  return str;
};

/*
 The main function to calculate message digest
 */
const sha1 = s => {
  let str = '';

  if (typeof s !== 'string') {

    if (isInstance(s, ArrayBuffer) ||
      (s && isInstance(s.buffer, ArrayBuffer))) {
      s = fromArrayBuffer(s);
    }

    for (let i = -1, l = s.length; ++i < l;) {
      str += String.fromCharCode(s[i]);
    }
  } else {
    str = utf8Encode(s);
  }

  return binb2hex(calcHash(alignSHA1(str)));
};

function fromArrayBuffer(array) {
  const buf = new Uint8Array(array);
  return buf;
}

function utf8Encode(str) {
  try {
    return new TextEncoder().encode(str, 'utf-8').reduce((prev, curr) => prev + String.fromCharCode(curr), '');
  } catch (e) { // no TextEncoder available?
    return unescape(encodeURIComponent(str)); // monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
  }
}

function isInstance(obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name);
}

export { sha1 };

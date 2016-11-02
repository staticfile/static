BigIntegers and RSA in JavaScript
=================================

The `jsbn` library is a pure JavaScript implementation of arbitrary-precision
integer arithmetic.

Demos
-----

 * [RSA Encryption Demo](rsa.html) - simple RSA encryption of a string with a
   public key
 * [RSA Cryptography Demo](rsa2.html) - more complete demo of RSA encryption,
   decryption, and key generation

Source Code
-----------

The API for the `jsbn` library closely resembles that of the
[`java.math.BigInteger`](http://java.sun.com/j2se/1.3/docs/api/java/math/BigInteger.html) class in Java.

For example:

    x = new BigInteger("abcd1234", 16);
    y = new BigInteger("beef", 16);
    z = x.mod(y);
    alert(z.toString(16));

will print `b60c`.

 * [`jsbn.js`](jsbn.js) - basic BigInteger implementation, just enough for RSA encryption and not much more.
 * [`jsbn2.js`](jsbn2.js) - the rest of the library, including most public `BigInteger` methods.
 * [`rsa.js`](rsa.js) - implementation of RSA encryption, does not require `jsbn2.js`.
 * [`rsa2.js`](rsa2.js) - rest of RSA algorithm, including decryption and keygen.
 * [`rng.js`](rng.js) - rudimentary entropy collector and RNG interface, requires a PRNG backend to define `prng_newstate()`.
 * [`prng4.js`](prng4.js) - ARC4-based PRNG backend for `rng.js`, very small.
 * [`base64.js`](base64.js) - Base64 encoding and decoding routines.

Interoperability
----------------

The demo encrypts strings directly using PKCS#1 encryption-style
padding (type 2), which is currently the only supported format.
To show interoperability with a potential OpenSSL-based backend
that decrypts strings, try the following on any system with the
OpenSSL command line tool installed:

 1. Generate a new public/private keypair:

        $ openssl genrsa -out key.pem
        Generating RSA private key, 512 bit long modulus
        ..++++++++++++
        ..............++++++++++++
        e is 65537 (0x10001)
        $

 2. Extract the modulus from your key:

        $ openssl rsa -in key.pem -noout -modulus
        Modulus=DA3BB4C40E3C7E76F7DBDD8BF3DF0714CA39D3A0F7F9D7C2E4FEDF8C7B28C2875F7EB98950B22AE82D539C1ABC1AB550BA0B2D52E3EF7BDFB78A5E817D74BBDB
        $

 3. Go to the [RSA Encryption demo](rsa.html) and paste the modulus value into the
    "Modulus (hex)" field at the bottom.
 4. Make sure the value in the "Public exponent" field is "10001", or whatever
    value your public key uses.
 5. Type in a short string (e.g. `testing`) into the "Plaintext (string)" field
    and click on "encrypt".  The result should appear in the "Ciphertext"
    fields.
 6. Copy the base64 version of the ciphertext and paste it as the input of
    the following command:

        $ openssl base64 -d | openssl rsautl -inkey key.pem -decrypt
        1JW24UMKntVhmmDilAYC1AjLxgiWHBzTzZsCVAejLjVri92abLHkSyLisVyAdYVr
        fiS7FchtI9vupe9JF/m3Kg==

    Hit ctrl-D or whatever your OS uses for end-of-file.
    Your original plaintext should appear:

        testing$

Performance
-----------

Since `jsbn` is pure JavaScript, its performance will depend on the hardware as
well as the quality of the JavaScript execution environment, but will be
considerably slower than native implementations in languages such as C/C++ or
Java.

On a 1GHz Intel PC running Mozilla:

<table cellspacing=5>
<tr><th align=left>Key type</th><th align=center>Encryption time</th><th align=center>Decryption time</th></tr>
<tr><td align=left>RSA 512-bit (e=3)</td><td align=center>23ms</td><td align=center>1.0s</td></tr>
<tr><td align=left>RSA 512-bit (e=F4)</td><td align=center>86ms</td><td align=center>1.0s</td></tr>
<tr><td align=left>RSA 1024-bit (e=3)</td><td align=center>56ms</td><td align=center>6.0s</td></tr>
<tr><td align=left>RSA 1024-bit (e=F4)</td><td align=center>310ms</td><td align=center>6.0s</td></tr>
</table>

On similar hardware, running IE6:

<table cellspacing=5>
<tr><th align=left>Key type</th><th align=center>Encryption time</th><th align=center>Decryption time</th></tr>
<tr><td align=left>RSA 512-bit (e=3)</td><td align=center>50ms</td><td align=center>0.7s</td></tr>
<tr><td align=left>RSA 512-bit (e=F4)</td><td align=center>60ms</td><td align=center>0.7s</td></tr>
<tr><td align=left>RSA 1024-bit (e=3)</td><td align=center>60ms</td><td align=center>4.3s</td></tr>
<tr><td align=left>RSA 1024-bit (e=F4)</td><td align=center>220ms</td><td align=center>4.3s</td></tr>
</table>

Timing measurements, especially under IE, appear to have limited
precision for faster operations.

History
-------

<dl>
<dt><b>Version 1.4 (7/1/2013):</b></dt>
<dd>Fixed variable name collision between sha1.js and base64.js.
<dd>Obtain entropy from window.crypto.getRandomValues where available.
<dd>Added ECCurveFp.encodePointHex.
<dd>Fixed inconsistent use of DV in jsbn.js.
<dt><b>Version 1.3 (7/3/2012):</b></dt>
<dd>Fixed bug when comparing negative integers of different word lengths.
<dt><b>Version 1.2 (3/29/2011):</b></dt>
<dd>Added <code>square</code> method to improve ECC performance.
<dd>Use randomized bases in <code>isProbablePrime</code>
<dt><b>Version 1.1 (9/15/2009):</b></dt>
<dd>Added support for utf-8 encoding of non-ASCII characters
when PKCS1 encoding and decoding JavaScript strings.
<dd>Fixed bug when creating a new BigInteger("0") in a non power-of-2 radix.
</dl>

Licensing
---------

`jsbn` is released under a BSD license.
See [`LICENSE`](LICENSE) for details.

[Tom Wu](mailto:tjw@cs.stanford.edu)

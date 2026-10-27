# Cryptography From the Ground Up
### The Mathematics and Intuition of Keeping Secrets — From Modular Arithmetic to TLS, WiFi, and Beyond

A clear, readable path into real cryptography, built for understanding. It
develops the mathematics from scratch (modular arithmetic, number theory,
groups/rings/fields, finite fields, probability and hardness), builds the
intuition for every primitive, gives small toy implementations alongside the
real math, and carries the story all the way to the protocols you actually use:
TLS, WiFi (WPA2/WPA3), Signal, SSH, VPNs, and telecom security. Enough to start
working as an entry-level cryptographer. Same conversational voice and visual
language as the companion *Probability*, *Algorithms*, and other ground-up books.

## What it covers

- **Foundations and math** — modular arithmetic, primes/GCD/Euclid, groups,
  rings, fields, finite fields GF(2^n), probability and information for crypto,
  and computational hardness / one-way functions.
- **Symmetric cryptography** — perfect secrecy and the one-time pad, stream
  ciphers, block ciphers (Feistel, DES, AES), modes of operation, hash functions
  (SHA-2/3), MACs and HMAC, authenticated encryption, and CSPRNGs.
- **Public-key cryptography** — Diffie-Hellman, RSA (with the math), the discrete
  log problem and ElGamal, elliptic curves, digital signatures, and key exchange
  with forward secrecy.
- **Protocols and applications** — certificates and PKI, TLS, WiFi security,
  Signal/the Double Ratchet, SSH, telecom crypto (GSM/LTE/5G), and VPNs.
- **Advanced topics** — zero-knowledge proofs, commitments and secret sharing,
  homomorphic encryption, multiparty computation, post-quantum cryptography, and
  the cryptography behind blockchains.
- **Attacks and safe implementation** — side-channel and timing attacks, common
  pitfalls (padding oracles, nonce reuse, weak RNGs), and how to implement crypto
  safely.

## A warning

The toy implementations in this book are for **learning only**. Do not use them
to protect real data — use audited libraries. The book explains exactly why.

## Build

```bash
./build.sh           # writes dist/cryptography-from-the-ground-up.pdf
```

## License

MIT — see `LICENSE`.

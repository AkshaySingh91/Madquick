# Vault - Password Generator + Vault (Next.js + MongoDB)

A minimal, privacy-first password generator and encrypted vault built with Next.js App Router, TypeScript, TailwindCSS, NextAuth, and MongoDB (Mongoose). Vault items are encrypted client-side with AES; the server and database never see plaintext.

## Features
- Email + password authentication (NextAuth Credentials, bcrypt)
- Password generator (length, charset toggles, exclude look-alikes, copy with auto-clear)
- Encrypted vault (title, username, password, url, notes)
- Client-side encryption using AES (CryptoJS) with PBKDF2-derived key
- CRUD for vault items via API routes
- Route protection for `/vault`

## Tech Stack
- Next.js (App Router, TypeScript)
- NextAuth (Credentials)
- MongoDB with Mongoose
- TailwindCSS
- CryptoJS (AES + PBKDF2)

## Local Setup
1. Prerequisites: Node 18+, npm, MongoDB Atlas URI
2. Install dependencies:
```bash
npm install
```
3. Create `.env.local` in project root:
```bash
MONGODB_URI=YOUR_MONGODB_ATLAS_URI
NEXTAUTH_SECRET=generate_a_long_random_string
NEXTAUTH_URL=http://localhost:3000
```
4. Run dev server:
```bash
npm run dev
```
5. Open `http://localhost:3000`.

## How It Works
- On signup, the server stores `email`, `bcrypt(password)`, and a random `kdfSalt` (base64).
- On login, session exposes `kdfSalt`. The client derives a key from the user's entered master password using PBKDF2.
- Vault items are encrypted/decrypted in the browser with AES before being sent to or after being retrieved from the server.

## Deployment (Vercel + MongoDB Atlas)
1. Push this repo to GitHub.
2. Create a MongoDB Atlas cluster and get the connection string.
3. Create a Vercel project and import the repo.
4. Set Vercel Project Environment Variables:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET` (use `openssl rand -base64 48`)
   - `NEXTAUTH_URL` (e.g., `https://your-app.vercel.app`)
5. Deploy. After deploy, ensure the Middleware protects `/vault` and that login works end-to-end.

## Crypto Note
Used AES encryption (CryptoJS) for client-side encryption of vault items. The secret key is derived from the user's password via PBKDF2 and never leaves the client, ensuring the server never sees plaintext data.

## Scripts
- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - start production server

## Security Considerations
- Clipboard auto-clear after 15s to reduce exposure window.
- Do not store the master password; only derive a key in-memory.
- Increase PBKDF2 iterations or migrate to WebCrypto/SubtleCrypto for stronger, native implementations if required.

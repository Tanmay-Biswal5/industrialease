# IndustriaLease

Secure unified gateway for Maharashtra industrial approvals, based on the Cognitive Quest SIH26130 product plan.

## Run locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The deployment health probe is available at `/api/health`.

## First setup: Google login and Gemini

Do not use a Gmail API key for login. The login flow needs Google OAuth 2.0 credentials:

1. In Google Cloud Console, create or select a project, configure the OAuth consent screen, and create a **Web application** OAuth client.
2. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI for local development. Add the production callback URI after deployment.
3. Copy `.env.example` to `.env.local` and set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and a random `AUTH_SECRET`. Keep `.env.local` out of source control.
4. In Google AI Studio, create a Gemini API key and set `GEMINI_API_KEY`. The key must only be read by server code; never prefix it with `NEXT_PUBLIC_`.
5. Set `GOOGLE_ALLOWED_DOMAIN` only if access must be limited to a verified government or organization domain. Domain checks are not a replacement for server-side RBAC.

Google sign-in is implemented at `/api/auth/login/google` and `/api/auth/callback/google`. Gemini requests use the protected `/api/gemini` route. These routes are suitable for staging; add database-backed sessions, RBAC, audit logging, private storage, and document scanning before handling real applicant documents.

## Security baseline

- Keep documents in a private object-storage bucket. Use short-lived, server-issued signed URLs rather than exposing bucket credentials to the browser.
- Encrypt database, Redis, and object storage with provider-managed keys; use application-level envelope encryption for especially sensitive document fields and rotate keys through a managed KMS.
- Put authentication and authorization on the server with OIDC, MFA, short-lived sessions, CSRF protection, and RBAC. Never trust a role sent by the client.
- Validate file type, size, content, and malware scan results before storage. Store metadata separately from encrypted document bytes.
- Record immutable audit events for reads, downloads, updates, approvals, and role changes. Do not log tokens, document contents, or personal data.
- Set `AUTH_SECRET`, database credentials, and storage credentials only through the deployment secret manager. `.env.local` is ignored and must never be committed.
- Before production: add dependency scanning, SAST/DAST, backup restore drills, key rotation, retention/deletion policies, incident response, and an independent security review.

## Deploy on Render

1. Create a private GitHub repository and push the `industria-lease` folder, excluding `.env.local`.
2. In Render, choose **New > Blueprint**, connect the repository, and select `render.yaml`.
3. Enter the `sync: false` values in Render's Environment page. Never commit them to `render.yaml`.
4. Add the production Google OAuth callback URI after Render gives the service URL:
	`https://YOUR-RENDER-SERVICE.onrender.com/api/auth/callback/google`
5. Verify `/api/health`, HTTPS, logs, and the staging deployment before using production data.
6. Provision PostgreSQL, Redis, private object storage, KMS, centralized logs, and uptime monitoring in the approved region before enabling real documents.

The `render.yaml` Blueprint uses `npm ci && npm run build`, `npm run start`, and `/api/health` as the health check.

The application persists the current browser prototype workspace locally. It does not yet provide database-backed application persistence or encrypted document uploads; those server-side controls must be implemented before handling real citizen or business data.
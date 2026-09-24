---
name: vercel-google-gemini-deployment
description: 'Deploy the IndustriaLease Next.js app to Vercel and connect Google OAuth/Gmail and Gemini API securely. Use for Vercel deployment, Google login, Gmail integration, OAuth callback setup, Gemini API keys, environment variables, or production integration checks.'
argument-hint: 'Describe the deployment target and whether Gmail means Google sign-in, Gmail mailbox access, or both.'
user-invocable: true
---

# Vercel, Google, and Gemini Deployment

Use this workflow to deploy IndustriaLease and configure Google services without exposing credentials or treating a Gmail address as an API credential.

## Clarify the Google requirement

Before changing code, identify which of these is needed:

- **Google sign-in only:** Google OAuth 2.0 client credentials and an application session layer.
- **Gmail mailbox access:** Gmail API enabled in Google Cloud, OAuth consent/scopes, and a server-side refresh-token flow. A Gmail API key is not a login credential and is not sufficient for private mailbox data.
- **Both:** Configure OAuth once with the minimum combined scopes, then keep mailbox operations in protected server routes.
- **Gemini:** A separate Gemini API key from Google AI Studio or Google Cloud. Keep it server-side and never use a `NEXT_PUBLIC_` prefix.

If the user has not specified mailbox actions, do not request Gmail scopes or add Gmail code; ask whether they need reading, sending, labels, or another operation.

## Preconditions

1. Inspect the current app routes and environment contract. Preserve the existing server-only variables in `.env.example` and `src/lib/env.ts`.
2. Confirm the local checks available in `package.json` (`npm run lint`, `npm run build`, and `npm test`).
3. Ensure `.env.local`, OAuth client secrets, refresh tokens, and API keys are ignored by git. Never print or commit secret values.
4. Use the repository's existing Next.js conventions. Keep Google and Gemini calls in server code such as Route Handlers or server-only modules.

## Configure Google Cloud

1. Select or create the intended Google Cloud project.
2. Configure the OAuth consent screen. Use Internal only when every account belongs to the same eligible organization; otherwise configure External and add test users while the app is in testing.
3. Enable only the APIs needed. Enable Gmail API only for mailbox features; do not enable it merely for Google sign-in.
4. Create a Web application OAuth client.
5. Add the exact local redirect URI:
   `http://localhost:3000/api/auth/callback/google`
6. Add the exact production redirect URI after the Vercel domain is known:
   `https://<production-domain>/api/auth/callback/google`
7. For mailbox access, request the narrowest Gmail scopes possible and explain verification/consent requirements before using restricted scopes. Store refresh tokens encrypted server-side and support revocation.

## Google Cloud Console walkthrough

Use these steps when the user needs exact console clicks. The Google credentials are created in Google Cloud and then copied as environment variable values into Vercel; there is no separate "Vercel API" to generate in Google Cloud.

### Create the Google OAuth credentials

1. Open `https://console.cloud.google.com/` and select the correct project from the project picker.
2. Go to **APIs & Services > OAuth consent screen**.
3. Choose **Internal** for an eligible organization-only app, or **External** for consumer/other Google accounts. Complete the app name, support email, developer contact, and authorized domain when requested.
4. Add only the scopes required by the application. Google sign-in normally needs OpenID Connect identity scopes; do not add Gmail scopes unless mailbox actions are implemented.
5. If the app is External and still in testing, add the intended Google accounts under **Test users**.
6. Go to **APIs & Services > Credentials > Create credentials > OAuth client ID**.
7. Select **Web application** and name it by environment, for example `industria-lease-production`.
8. Under **Authorized JavaScript origins**, add the site origin when the authentication library requires it, for example `https://<production-domain>`.
9. Under **Authorized redirect URIs**, add the exact callback used by the app:
   `https://<production-domain>/api/auth/callback/google`
10. Click **Create**, then copy the **Client ID** to Vercel as `GOOGLE_CLIENT_ID`. Copy the **Client secret** to Vercel as `GOOGLE_CLIENT_SECRET`. Never put either value in client-side code or commit it.

### Enable Gmail API only for mailbox features

1. In the same project, open **APIs & Services > Library**.
2. Search for **Gmail API**, open it, and click **Enable**.
3. Return to **APIs & Services > OAuth consent screen > Data access** (the label may appear as **Scopes** depending on the console UI).
4. Add the narrowest scope needed, such as read-only access for reading messages. Avoid full mail or modify scopes unless the feature truly requires them.
5. Reopen the OAuth client and ensure the same production callback URI is present. The user must complete the OAuth consent flow to grant mailbox access; an API key alone cannot access a private Gmail mailbox.
6. If Google marks the requested scope as sensitive or restricted, complete the required consent-screen verification before production use. Do not bypass verification by collecting user passwords or asking users to paste tokens.

### Create the Gemini credential

1. For a Gemini API key, open Google AI Studio at `https://aistudio.google.com/apikey`, select the intended Google project, and choose **Create API key**. If the organization requires centralized billing or Vertex AI, configure Gemini through Google Cloud instead and follow that provider's authentication requirements.
2. Copy the key once and add it in Vercel as `GEMINI_API_KEY` for the required environment. Do not prefix it with `NEXT_PUBLIC_`.
3. Rotate or revoke the key from the provider console if it is exposed. Never paste it into a browser chat, source file, screenshot, or support ticket.

### Add credentials to Vercel

1. Open the Vercel project and go to **Settings > Environment Variables**.
2. Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, and `GEMINI_API_KEY` with the correct **Production** or **Preview** scope. Add `DATABASE_URL`, `REDIS_URL`, and storage credentials only when those services exist.
3. Use **Sensitive** protection where available. Do not select **Expose to browser** for secrets.
4. Save the variables and redeploy. Vercel applies changed environment variables to new deployments, not already-running deployments.
5. Test the deployed health endpoint, then test Google sign-in. Confirm the callback URL in the browser exactly matches the one registered in Google Cloud; differences in scheme, host, path, or trailing slash can cause `redirect_uri_mismatch`.

## Configure Gemini

1. Create a Gemini credential in the approved Google AI Studio or Google Cloud project.
2. Add it only as `GEMINI_API_KEY` in local and Vercel server environments.
3. Do not put it in browser bundles, client components, `NEXT_PUBLIC_GEMINI_API_KEY`, logs, prompts, or error responses.
4. Call Gemini through a protected server route. Validate uploaded content and model output using the existing security helpers before storing or displaying results.
5. Set model, quota, timeout, input-size, and retry behavior explicitly. Treat document text as untrusted input and keep compliance decisions reviewable by a human.

## Deploy to Vercel

1. Run locally:
   ```text
   npm ci
   npm run lint
   npm run build
   npm test
   ```
2. Push the repository to a private Git provider repository without `.env.local` or generated secrets.
3. In Vercel, import the repository, select the `industria-lease` root directory, and verify the Next.js framework and `npm run build` command.
4. Add environment variables separately for Preview and Production. At minimum configure `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GEMINI_API_KEY`; add database, Redis, and storage values only when those services are provisioned.
5. Generate `AUTH_SECRET` with a cryptographically secure random value of at least 32 characters. Do not reuse it across environments.
6. Deploy Preview first. Add the Preview OAuth callback URI if preview sign-in is required; use a stable production URL for the production client where possible.
7. After the production domain is assigned, add its exact OAuth callback URI in Google Cloud, then redeploy if Vercel environment values changed.
8. Verify `https://<production-domain>/api/health` returns a healthy, non-cached response. Confirm HTTPS, deployment logs, and no secret values in logs or client JavaScript.

## Validate the integration

- Google sign-in redirects to the exact callback and returns to the app with a server-side session.
- Unauthorized users cannot invoke Gemini or Gmail routes.
- Gmail tokens, if used, are encrypted, refreshable, revocable, and never returned to the browser.
- Gemini requests enforce authentication, input limits, rate limits, timeouts, and structured output validation.
- Production rejects placeholder values and dangerous `NEXT_PUBLIC_` secret names through the existing environment validation.
- Preview and Production use the intended, separate secrets and callback URIs.
- Run `npm run lint`, `npm run build`, and `npm test` after implementation. Test the deployed health endpoint and one authenticated integration flow without using real sensitive documents.

## Stop conditions

Stop before enabling production data if OAuth consent, session/RBAC, CSRF protection, token encryption, audit logging, private storage, malware scanning, or document retention controls are missing. Report the exact missing control and keep the deployment in a safe staging state.

## Completion report

Summarize the Vercel project/domain, configured environment variable names (never values), Google OAuth callback URIs, Gmail scopes and operations if applicable, Gemini server route, checks run, and any remaining production blockers.
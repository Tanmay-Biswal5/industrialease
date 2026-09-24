import { NextResponse } from "next/server";
import { createSessionCookie, SESSION_COOKIE, STATE_COOKIE, verifyOAuthState } from "@/lib/auth";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookies = request.headers.get("cookie") || "";
  const stateCookie = cookies.match(new RegExp(`${STATE_COOKIE}=([^;]+)`))?.[1];
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) return NextResponse.json({ error: "Google OAuth is not configured." }, { status: 503 });
  if (!code || !state || state !== stateCookie || !verifyOAuthState(state)) return NextResponse.json({ error: "Invalid or expired OAuth state." }, { status: 400 });

  const redirectUri = new URL("/api/auth/callback/google", request.url).toString();
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
    cache: "no-store",
  });
  if (!tokenResponse.ok) return NextResponse.json({ error: "Google authorization could not be completed." }, { status: 502 });

  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token) return NextResponse.json({ error: "Google did not return an access token." }, { status: 502 });
  const profileResponse = await fetch(GOOGLE_USERINFO_URL, { headers: { Authorization: `Bearer ${token.access_token}` }, cache: "no-store" });
  if (!profileResponse.ok) return NextResponse.json({ error: "Google profile could not be loaded." }, { status: 502 });

  const profile = (await profileResponse.json()) as { sub?: string; email?: string; name?: string; picture?: string; email_verified?: boolean; hd?: string };
  if (!profile.sub || !profile.email || profile.email_verified !== true) return NextResponse.json({ error: "A verified Google account is required." }, { status: 403 });
  const allowedDomain = process.env.GOOGLE_ALLOWED_DOMAIN?.trim().toLowerCase();
  if (allowedDomain && profile.email.toLowerCase().split("@")[1] !== allowedDomain) return NextResponse.json({ error: "This Google account is not allowed." }, { status: 403 });

  const response = NextResponse.redirect(new URL("/?auth=connected", request.url));
  response.cookies.set(SESSION_COOKIE, createSessionCookie({ sub: profile.sub, email: profile.email, name: profile.name, picture: profile.picture, createdAt: Date.now() }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  response.cookies.set(STATE_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
  return response;
}

import { NextResponse } from "next/server";
import { createOAuthState, STATE_COOKIE } from "@/lib/auth";

export function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Google OAuth is not configured on this deployment." }, { status: 503 });
  }

  const state = createOAuthState();
  const redirectUri = new URL("/api/auth/callback/google", request.url).toString();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}

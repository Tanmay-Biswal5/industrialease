import { NextResponse } from "next/server";
import { readSessionCookie, SESSION_COOKIE } from "@/lib/auth";
import { buildSafePrompt, sanitizeAIOutputText } from "@/lib/security/ai";

const MAX_INPUT_LENGTH = 6000;

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie")?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
  if (!readSessionCookie(cookie)) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Gemini is not configured on this deployment." }, { status: 503 });

  let body: { prompt?: unknown };
  try {
    body = (await request.json()) as { prompt?: unknown };
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (typeof body.prompt !== "string" || !body.prompt.trim() || body.prompt.length > MAX_INPUT_LENGTH) {
    return NextResponse.json({ error: `prompt must be a non-empty string under ${MAX_INPUT_LENGTH} characters.` }, { status: 400 });
  }

  const safePrompt = buildSafePrompt(
    "You are a cautious industrial approvals assistant. Summarize likely next steps, identify uncertainty, and never claim legal approval or guaranteed eligibility.",
    body.prompt.trim(),
  );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: safePrompt.prompt }] }] }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: "Gemini request failed." }, { status: 502 });
    const result = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = result.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join(" ").trim();
    if (!text) return NextResponse.json({ error: "Gemini returned no usable response." }, { status: 502 });
    return NextResponse.json({ text: sanitizeAIOutputText(text), flaggedForSuspicion: safePrompt.flaggedForSuspicion });
  } catch {
    return NextResponse.json({ error: "Gemini request timed out or could not be reached." }, { status: 504 });
  } finally {
    clearTimeout(timeout);
  }
}

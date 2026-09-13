import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  // CSRF / Origin Verification for state-modifying requests
  const mutatingMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (mutatingMethods.includes(request.method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");

    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return new NextResponse(
            JSON.stringify({ error: "Cross-site request forgery protection triggered." }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
      } catch {
        return new NextResponse(
          JSON.stringify({ error: "Invalid Origin header." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Attach traceability header to outgoing response
  response.headers.set("x-request-id", requestId);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets (.svg, .png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

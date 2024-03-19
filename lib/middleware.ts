import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// eslint-disable-next-line max-len
const userAgentTest =
  /(bot|lighthouse|spider|pinterest|crawler|archiver|flipboard|mediapartners|facebookexternalhit|quora|whatsapp|outbrain|yahoo! slurp|embedly|developers.google.com\/+\/web\/snippet|vkshare|w3c_validator|tumblr|skypeuripreview|nuzzel|qwantify|bitrix link preview|XING-contenttabreceiver|Chrome-Lighthouse|mail\.ru)/gi;
const s4aHost = "api.seo4ajax.com";
const apiEndPoint = `https://${s4aHost}/`;

export default function s4aMiddleware(siteToken: string) {
  if (!siteToken) throw new Error("siteToken must be set");
  const s4aBaseUrl = apiEndPoint + siteToken;

  async function s4aProxy(
    request: NextRequest,
    options?: {
      pathPattern: RegExp,
      userAgentPattern: RegExp
    }
  ) {
    const { nextUrl, headers, method } = request;

    if (method !== "GET" && method !== "HEAD") {
      return NextResponse.next();
    }

    const path = nextUrl.pathname + nextUrl.search;
    const s4aURL = s4aBaseUrl + path;

    if (
      nextUrl.searchParams &&
      (nextUrl.searchParams.get("_escaped_fragment_") != null)
    ) {
      return serveCapture();
    }

    if (
      path &&
      !path.match(/index\.html?/i) &&
      path.match(/.*(\.[^?]{2,4}$|\.[^?]{2,4}?.*)/)
    ) {
      return NextResponse.next();
    }

    async function serveCapture() {
      let xForwardedFor = request.headers.get("x-forwarded-for");
      const ip = request.ip;

      if (ip) {
        if (xForwardedFor) {
          xForwardedFor = ip + ", " + xForwardedFor;
        } else {
          xForwardedFor = ip;
        }
      }

      const requestHeaders = new Headers(request.headers);
      if (xForwardedFor) {
        requestHeaders.set("x-forwarded-for", xForwardedFor);
      }
      // override host header to fix DNS resolution
      requestHeaders.set("host", s4aHost);

      const s4aRequest = new Request(s4aURL, {
        redirect: "manual",
        headers: requestHeaders,
      });
      const s4aResponse = await fetch(s4aRequest);

      // workaround for this bug:
      // https://github.com/vercel/next.js/issues/39913
      const location = s4aResponse.headers.get("location");
      if (location && !location.match(/^https?:/)) {
        s4aResponse.headers.set(
          "location",
          new URL(location, nextUrl.origin).href,
        );
      }

      return s4aResponse;
    }

    function isBotTest(userAgent: string | null) {
      if (userAgent) {
        const userAgentPattern = options && options.userAgentPattern ? options.userAgentPattern : userAgentTest;
        const isBot = userAgent!.match(userAgentPattern) &&
          (options && options.pathPattern
            ? path.match(options.pathPattern)
            : true);
        return isBot;
      }
      return false;
    }

    return isBotTest(headers.get("user-agent"))
      ? serveCapture()
      : NextResponse.next();
  }

  return s4aProxy;
}

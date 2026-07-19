import { OIDC_TRANSACTION_COOKIE_NAME, SESSION_COOKIE_NAME, type OidcTransaction } from "@erp/auth";
import {
  clearCookieHeader,
  createOidcSession,
  decodeCookie,
  encodeCookie,
  exchangeAuthorizationCode,
  readCookie,
  redirectResponse,
  publicUrl,
  sessionMaxAgeSeconds,
  setCookieHeader,
  verifyOidcIdToken,
} from "../../../../lib/auth-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const rawTx = readCookie(request.headers.get("cookie"), OIDC_TRANSACTION_COOKIE_NAME);
  const tx = decodeCookie<OidcTransaction>(rawTx);

  if (!tx || !state || state !== tx.state || !code) {
    const response = redirectResponse(publicUrl(request, "/auth/access-denied?reasonCode=AUTH_CALLBACK_INVALID"));
    response.headers.append("Set-Cookie", clearCookieHeader(OIDC_TRANSACTION_COOKIE_NAME));
    return response;
  }

  try {
    const idToken = await exchangeAuthorizationCode(code, tx.pkceVerifier);
    const claims = await verifyOidcIdToken(idToken, tx.nonce);
    const session = createOidcSession(claims);
    console.info("OIDC session established", { subjectId: session.subjectId, roles: session.roles });
    const response = redirectResponse(publicUrl(request, tx.returnUrl));
    response.headers.append("Set-Cookie", clearCookieHeader(OIDC_TRANSACTION_COOKIE_NAME));
    response.headers.append("Set-Cookie", setCookieHeader(SESSION_COOKIE_NAME, encodeCookie(session), sessionMaxAgeSeconds(session)));
    return response;
  } catch (error) {
    console.error("OIDC callback failed", { reason: error instanceof Error ? error.message : "unknown" });
    const response = redirectResponse(publicUrl(request, "/auth/access-denied?reasonCode=AUTH_CALLBACK_TOKEN_INVALID"));
    response.headers.append("Set-Cookie", clearCookieHeader(OIDC_TRANSACTION_COOKIE_NAME));
    return response;
  }
}

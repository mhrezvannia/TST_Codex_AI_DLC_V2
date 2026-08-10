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
  const providerError = url.searchParams.get("error");
  const rawTx = readCookie(request.headers.get("cookie"), OIDC_TRANSACTION_COOKIE_NAME);
  const tx = decodeCookie<OidcTransaction>(rawTx);

  if (providerError) {
    const status =
      providerError === "access_denied"
        ? "cancelled"
        : providerError === "temporarily_unavailable" || providerError === "server_error"
          ? "unavailable"
          : "failed";
    const recoveryParams = new URLSearchParams({ status });
    if (tx?.returnUrl) {
      recoveryParams.set("returnUrl", tx.returnUrl);
    }
    const response = redirectResponse(publicUrl(request, `/auth/sign-in?${recoveryParams.toString()}`));
    response.headers.append("Set-Cookie", clearCookieHeader(OIDC_TRANSACTION_COOKIE_NAME));
    return response;
  }

  if (!tx || !state || state !== tx.state || !code) {
    const response = redirectResponse(publicUrl(request, "/auth/sign-in?status=expired"));
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
    const response = redirectResponse(publicUrl(request, "/auth/sign-in?status=failed"));
    response.headers.append("Set-Cookie", clearCookieHeader(OIDC_TRANSACTION_COOKIE_NAME));
    return response;
  }
}

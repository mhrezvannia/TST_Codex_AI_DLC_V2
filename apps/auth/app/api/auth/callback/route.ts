import { OIDC_TRANSACTION_COOKIE_NAME, SESSION_COOKIE_NAME, type OidcTransaction } from "@erp/auth";
import {
  clearCookieHeader,
  createLocalSession,
  decodeCookie,
  encodeCookie,
  readCookie,
  redirectResponse,
  setCookieHeader,
} from "../../../../lib/auth-server";

export function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const rawTx = readCookie(request.headers.get("cookie"), OIDC_TRANSACTION_COOKIE_NAME);
  const tx = decodeCookie<OidcTransaction>(rawTx);

  if (!tx || !state || state !== tx.state || !code) {
    const response = redirectResponse(new URL("/access-denied?reasonCode=AUTH_CALLBACK_INVALID", request.url));
    response.headers.append("Set-Cookie", clearCookieHeader(OIDC_TRANSACTION_COOKIE_NAME));
    return response;
  }

  const session = createLocalSession("local-user");
  const response = redirectResponse(new URL(tx.returnUrl, request.url));
  response.headers.append("Set-Cookie", clearCookieHeader(OIDC_TRANSACTION_COOKIE_NAME));
  response.headers.append("Set-Cookie", setCookieHeader(SESSION_COOKIE_NAME, encodeCookie(session), 3600));
  return response;
}

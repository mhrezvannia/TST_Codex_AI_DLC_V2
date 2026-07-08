import { OIDC_TRANSACTION_COOKIE_NAME } from "@erp/auth";
import {
  authConfig,
  createLocalSession,
  createOidcTransaction,
  encodeCookie,
  isAuthBypassEnabled,
  redirectResponse,
  setCookieHeader
} from "../../../../lib/auth-server";
import { SESSION_COOKIE_NAME } from "@erp/auth";

export function GET(request: Request) {
  const url = new URL(request.url);
  const tx = createOidcTransaction(url.searchParams.get("returnUrl") ?? "/session");
  if (isAuthBypassEnabled()) {
    const response = redirectResponse(new URL(tx.returnUrl, request.url));
    response.headers.append("Set-Cookie", setCookieHeader(SESSION_COOKIE_NAME, encodeCookie(createLocalSession("local-user")), 3600));
    return response;
  }

  const authorizeUrl = new URL(authConfig.keycloakAuthorizeUrl);
  authorizeUrl.searchParams.set("client_id", authConfig.clientId);
  authorizeUrl.searchParams.set("redirect_uri", authConfig.redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid profile email");
  authorizeUrl.searchParams.set("state", tx.state);
  authorizeUrl.searchParams.set("nonce", tx.nonce);
  authorizeUrl.searchParams.set("code_challenge", "local-placeholder");
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  const response = redirectResponse(authorizeUrl);
  response.headers.append("Set-Cookie", setCookieHeader(OIDC_TRANSACTION_COOKIE_NAME, encodeCookie(tx), 300));
  return response;
}

import { SESSION_COOKIE_NAME } from "@erp/auth";
import { authConfig, clearCookieHeader, publicUrl, redirectResponse } from "../../../../lib/auth-server";

export function POST(request: Request) {
  const logoutUrl = new URL(authConfig.keycloakLogoutUrl);
  logoutUrl.searchParams.set("client_id", authConfig.clientId);
  logoutUrl.searchParams.set("post_logout_redirect_uri", publicUrl(request, "/signed-out").toString());
  const response = redirectResponse(logoutUrl);
  response.headers.append("Set-Cookie", clearCookieHeader(SESSION_COOKIE_NAME));
  return response;
}

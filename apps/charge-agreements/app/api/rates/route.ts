import { canonicalRateSearchParams } from "../../../lib/rates";
import { proxyRate } from "../../../lib/rate-proxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = canonicalRateSearchParams(url.searchParams);
  return proxyRate(request, `/api/charge-rates?${query}`, "GET", "read");
}

export async function POST(request: Request) {
  return proxyRate(request, "/api/charge-rates", "POST", "create");
}

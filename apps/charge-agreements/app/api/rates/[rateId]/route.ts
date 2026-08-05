import { proxyRate } from "../../../../lib/rate-proxy";

export async function GET(request: Request, context: { params: Promise<{ rateId: string }> }) {
  const { rateId } = await context.params;
  const url = new URL(request.url);
  const asOf = url.searchParams.get("asOf");
  const query = asOf ? `?asOf=${encodeURIComponent(asOf)}` : "";
  return proxyRate(request, `/api/charge-rates/${encodeURIComponent(rateId)}${query}`, "GET", "read");
}

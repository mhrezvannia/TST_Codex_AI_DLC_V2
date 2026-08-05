import { proxyRate } from "../../../../../../../lib/rate-proxy";

export async function POST(
  request: Request,
  context: { params: Promise<{ rateId: string; versionId: string }> }
) {
  const { rateId, versionId } = await context.params;
  return proxyRate(request,
    `/api/charge-rates/${encodeURIComponent(rateId)}/versions/${encodeURIComponent(versionId)}/successor`,
    "POST", "create-successor");
}

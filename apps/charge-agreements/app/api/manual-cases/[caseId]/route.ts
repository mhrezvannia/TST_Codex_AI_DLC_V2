import { MANUAL_CASE_POLICIES } from "../../../../lib/bff/policies";
import { proxyCharge } from "../../../../lib/bff/proxy-charge";

export async function GET(
  request: Request,
  context: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await context.params;
  return proxyCharge(request, MANUAL_CASE_POLICIES.detail, {
    identifiers: { caseId }
  });
}

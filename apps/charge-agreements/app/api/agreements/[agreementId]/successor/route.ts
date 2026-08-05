import { AGREEMENT_POLICIES } from "../../../../../lib/bff/policies";
import { proxyCharge } from "../../../../../lib/bff/proxy-charge";

export async function POST(
  request: Request,
  context: { params: Promise<{ agreementId: string }> }
) {
  const { agreementId } = await context.params;
  return proxyCharge(request, AGREEMENT_POLICIES.successor, {
    identifiers: { agreementId }
  });
}

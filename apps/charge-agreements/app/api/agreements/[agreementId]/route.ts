import { AGREEMENT_POLICIES } from "../../../../lib/bff/policies";
import { proxyCharge } from "../../../../lib/bff/proxy-charge";

type Context = { params: Promise<{ agreementId: string }> };

export async function GET(request: Request, context: Context) {
  const { agreementId } = await context.params;
  return proxyCharge(request, AGREEMENT_POLICIES.detail, {
    identifiers: { agreementId }
  });
}

export async function PUT(request: Request, context: Context) {
  const { agreementId } = await context.params;
  return proxyCharge(request, AGREEMENT_POLICIES.update, {
    identifiers: { agreementId }
  });
}

import { AGREEMENT_POLICIES } from "../../../../../../../lib/bff/policies";
import { proxyCharge } from "../../../../../../../lib/bff/proxy-charge";

type Context = {
  params: Promise<{ agreementId: string; versionId: string }>;
};

export async function POST(request: Request, context: Context) {
  const { agreementId, versionId } = await context.params;
  return proxyCharge(request, AGREEMENT_POLICIES.approve, {
    identifiers: { agreementId, versionId }
  });
}

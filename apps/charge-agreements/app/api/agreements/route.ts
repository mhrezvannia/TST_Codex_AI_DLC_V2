import { AGREEMENT_POLICIES } from "../../../lib/bff/policies";
import { proxyCharge } from "../../../lib/bff/proxy-charge";

export function GET(request: Request) {
  return proxyCharge(request, AGREEMENT_POLICIES.list);
}

export function POST(request: Request) {
  return proxyCharge(request, AGREEMENT_POLICIES.create);
}

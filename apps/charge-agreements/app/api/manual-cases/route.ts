import { MANUAL_CASE_POLICIES } from "../../../lib/bff/policies";
import { proxyCharge } from "../../../lib/bff/proxy-charge";

export function GET(request: Request) {
  return proxyCharge(request, MANUAL_CASE_POLICIES.list);
}

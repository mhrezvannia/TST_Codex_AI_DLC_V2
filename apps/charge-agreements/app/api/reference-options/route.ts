import { proxyReferenceOptions } from "../../../lib/bff/reference-options";

export function GET(request: Request) {
  return proxyReferenceOptions(request);
}

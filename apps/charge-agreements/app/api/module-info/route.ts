import { skeletonModuleInfo } from "../../../lib/charge-agreements";

const backendUrl = process.env.CHARGE_AGREEMENT_SERVICE_URL || "http://127.0.0.1:8084";

export async function GET() {
  try {
    const response = await fetch(`${backendUrl}/api/charge-agreements/module-info`, {
      headers: { "x-correlation-id": `charge-ui-${Date.now()}` },
      cache: "no-store"
    });
    if (!response.ok) {
      return Response.json({ ...skeletonModuleInfo, backendStatus: `unavailable:${response.status}` });
    }
    const payload = await response.json();
    return Response.json({ ...payload, backendStatus: "live" });
  } catch {
    return Response.json({ ...skeletonModuleInfo, backendStatus: "fallback" });
  }
}

import { chargeConfigurationReadiness } from "../../../lib/bff/config";

export function GET() {
  const ready = chargeConfigurationReadiness().ready;
  return Response.json(
    {
      service: "apps-charge-agreements",
      status: ready ? "UP" : "DOWN",
      timestamp: new Date().toISOString()
    },
    {
      status: ready ? 200 : 503,
      headers: { "content-type": "application/json; charset=utf-8" }
    }
  );
}

import { jsonHealth } from "@erp/api-core";

export function GET() {
  return Response.json(jsonHealth("apps-auth"));
}

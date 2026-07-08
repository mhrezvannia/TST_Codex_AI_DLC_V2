import { safeSessionSummary } from "../../../../lib/auth-server";

export function GET(request: Request) {
  return Response.json(safeSessionSummary(request));
}

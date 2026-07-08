import { correlationIdFrom, resolveReferenceDataPermissions, serviceErrorResponse } from "../../../../lib/service-clients";

export async function GET(request: Request) {
  const correlationId = correlationIdFrom(request, "ref-permissions");
  const permissions = await resolveReferenceDataPermissions(request, correlationId, "read");
  if (!permissions.ok) {
    return serviceErrorResponse(permissions);
  }
  return Response.json(permissions.data);
}

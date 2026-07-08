import { correlationIdFrom, listReferenceSets, resolveReferenceDataPermissions, serviceErrorResponse } from "../../../lib/service-clients";

export async function GET(request: Request) {
  const correlationId = correlationIdFrom(request, "ref-sets");
  const [permissions, sets] = await Promise.all([
    resolveReferenceDataPermissions(request, correlationId, "read"),
    listReferenceSets(correlationId)
  ]);
  if (!permissions.ok) {
    return serviceErrorResponse(permissions);
  }
  if (!sets.ok) {
    return serviceErrorResponse(sets);
  }
  return Response.json({
    correlationId,
    permissions: permissions.data,
    sets: sets.data
  });
}

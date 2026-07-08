import { validateMutationDraft } from "../../../../../../lib/reference-data";
import {
  asReferenceSetId,
  correlationIdFrom,
  getReferenceRecord,
  mutateReferenceRecord,
  mutationCommand,
  resolveReferenceDataPermissions,
  serviceErrorResponse
} from "../../../../../../lib/service-clients";

export async function GET(request: Request, context: { params: Promise<{ set: string; id: string }> }) {
  const { set: rawSet, id } = await context.params;
  const set = asReferenceSetId(rawSet);
  if (!set) {
    return Response.json({ error: "unknown reference set", set: rawSet.toUpperCase() }, { status: 404 });
  }
  const result = await getReferenceRecord(set, id, correlationIdFrom(request, "ref-record"));
  if (!result.ok) {
    return serviceErrorResponse(result);
  }
  return Response.json(result.data);
}

export async function PUT(request: Request, context: { params: Promise<{ set: string; id: string }> }) {
  const { set: rawSet, id } = await context.params;
  const set = asReferenceSetId(rawSet);
  if (!set) {
    return Response.json({ error: "unknown reference set", set: rawSet.toUpperCase() }, { status: 404 });
  }
  const correlationId = correlationIdFrom(request, "ref-update");
  const permissions = await resolveReferenceDataPermissions(request, correlationId, "update");
  if (!permissions.ok) {
    return serviceErrorResponse(permissions);
  }
  if (!permissions.data.canWrite) {
    return Response.json({ error: "authorization denied", permissions: permissions.data }, { status: 403 });
  }
  const draft = validateMutationDraft({ ...(await request.json()), set });
  if (!draft.success) {
    return Response.json({ error: "validation failed", issues: draft.error.issues, correlationId }, { status: 400 });
  }
  const result = await mutateReferenceRecord(set, "PUT", id, mutationCommand({
    ...draft.data,
    set,
    correlationId,
    operation: "update"
  }), correlationId);
  if (!result.ok) {
    return serviceErrorResponse(result);
  }
  return Response.json({ status: "updated", record: result.data, correlationId }, { status: result.status });
}

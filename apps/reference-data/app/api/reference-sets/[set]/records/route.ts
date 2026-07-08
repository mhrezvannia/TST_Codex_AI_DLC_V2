import { validateMutationDraft } from "../../../../../lib/reference-data";
import {
  asReferenceSetId,
  correlationIdFrom,
  listReferenceRecords,
  mutateReferenceRecord,
  mutationCommand,
  resolveReferenceDataPermissions,
  serviceErrorResponse
} from "../../../../../lib/service-clients";

export async function GET(request: Request, context: { params: Promise<{ set: string }> }) {
  const { set: rawSet } = await context.params;
  const set = asReferenceSetId(rawSet);
  if (!set) {
    return Response.json({ error: "unknown reference set", set }, { status: 404 });
  }
  const correlationId = correlationIdFrom(request, "ref-records");
  const result = await listReferenceRecords(set, request, correlationId);
  if (!result.ok) {
    return serviceErrorResponse(result);
  }
  return Response.json(result.data);
}

export async function POST(request: Request, context: { params: Promise<{ set: string }> }) {
  const { set: rawSet } = await context.params;
  const set = asReferenceSetId(rawSet);
  if (!set) {
    return Response.json({ error: "unknown reference set", set: rawSet.toUpperCase() }, { status: 404 });
  }
  const correlationId = correlationIdFrom(request, "ref-create");
  const permissions = await resolveReferenceDataPermissions(request, correlationId, "create");
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
  const result = await mutateReferenceRecord(set, "POST", null, mutationCommand({
    ...draft.data,
    set,
    correlationId,
    operation: "create"
  }), correlationId);
  if (!result.ok) {
    return serviceErrorResponse(result);
  }
  return Response.json({ status: "created", record: result.data, correlationId }, { status: result.status });
}

import { asReferenceSetId, correlationIdFrom, getReferenceRecordHistory, serviceErrorResponse } from "../../../../../../../lib/service-clients";

export async function GET(request: Request, context: { params: Promise<{ set: string; id: string }> }) {
  const { set: rawSet, id } = await context.params;
  const set = asReferenceSetId(rawSet);
  if (!set) {
    return Response.json({ error: "unknown reference set", set: rawSet.toUpperCase() }, { status: 404 });
  }
  const result = await getReferenceRecordHistory(set, id, correlationIdFrom(request, "ref-history"));
  if (!result.ok) {
    return serviceErrorResponse(result);
  }
  return Response.json(result.data);
}

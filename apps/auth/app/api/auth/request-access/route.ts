import { createCorrelationId, type RequestAccessSubmission } from "@erp/auth";
import { safeSessionSummary } from "../../../../lib/auth-server";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? ((await request.json().catch(() => ({}))) as { requestedResource?: string; requestedAction?: string; message?: string })
    : Object.fromEntries(await request.formData()) as { requestedResource?: string; requestedAction?: string; message?: string };
  const session = safeSessionSummary(request);
  const submission: RequestAccessSubmission = {
    submissionId: createCorrelationId(),
    subjectId: session.subjectId ?? session.subject,
    displayName: session.displayName,
    email: session.email,
    requestedResource: body.requestedResource ?? "shared-platform",
    requestedAction: body.requestedAction,
    message: body.message,
    submittedAt: new Date().toISOString(),
    correlationId: session.correlationId ?? createCorrelationId()
  };
  return Response.json({ accepted: true, submission });
}

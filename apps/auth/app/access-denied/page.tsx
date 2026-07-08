import { createCorrelationId } from "@erp/auth";

export default async function AccessDeniedPage({
  searchParams
}: {
  searchParams?: Promise<{ reasonCode?: string; resource?: string; action?: string; correlationId?: string }>;
}) {
  const params = await searchParams;
  const correlationId = params?.correlationId ?? createCorrelationId();
  const resource = params?.resource ?? "Shared Platform";
  const action = params?.action ?? "access";
  const reasonCode = params?.reasonCode ?? "DENY_NO_PERMISSION";
  return (
    <main>
      <h1>Access denied</h1>
      <p>{`You do not currently have permission to ${action} ${resource}.`}</p>
      <p>{`Reason: ${reasonCode}. Support trace: ${correlationId}.`}</p>
      <a
        data-testid="request-access-link"
        href={`/request-access?resource=${encodeURIComponent(resource)}&action=${encodeURIComponent(action)}&correlationId=${encodeURIComponent(correlationId)}`}
      >
        Request access
      </a>
    </main>
  );
}

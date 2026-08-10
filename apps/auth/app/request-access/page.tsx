import { AuthBoundaryLayout, AuthNotice, AuthStatePanel, DestinationSummary, SupportDetails } from "../AuthBoundary";

export default async function RequestAccessPage({
  searchParams
}: {
  searchParams?: Promise<{ resource?: string; action?: string; correlationId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const resource = safeBusinessLabel(params.resource, "the requested resource");
  const action = safeBusinessLabel(params.action, "the requested action");
  const correlationId = safeSupportValue(params.correlationId) ?? "Not available";

  return (
    <AuthBoundaryLayout>
      <AuthStatePanel
        eyebrow="Access governance"
        title="Access requests are not available here"
        summary="LinerCore cannot submit or track a durable approval request yet. No request has been created."
        wide
      >
        <DestinationSummary>{action} for {resource}</DestinationSummary>

        <AuthNotice title="Use your company access process.">
          Contact your platform administrator and include the protected resource and request ID shown below.
        </AuthNotice>

        <div className="auth-gateway__actions">
          <a className="auth-gateway__primary-action" href="/">Return to workspace</a>
          <a className="auth-gateway__secondary-action" href="/auth/access-denied">Return to access decision</a>
        </div>

        <SupportDetails
          items={[
            { term: "Resource", description: resource },
            { term: "Requested action", description: action },
            { term: "Request ID", description: correlationId },
            { term: "Request status", description: "Not submitted" }
          ]}
        />
      </AuthStatePanel>
    </AuthBoundaryLayout>
  );
}

function safeBusinessLabel(value: string | undefined, fallback: string) {
  const normalized = value?.trim();
  if (!normalized || normalized.length > 100 || !/^[\p{L}\p{N} .,:&'()/_-]+$/u.test(normalized)) {
    return fallback;
  }
  return normalized;
}

function safeSupportValue(value: string | undefined) {
  const normalized = value?.trim();
  return normalized && /^[A-Za-z0-9._:-]{1,100}$/.test(normalized) ? normalized : undefined;
}

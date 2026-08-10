import { createCorrelationId } from "@erp/auth";
import { AuthBoundaryLayout, AuthStatePanel, DestinationSummary, SupportDetails } from "../AuthBoundary";

type DenialParams = {
  reasonCode?: string;
  resource?: string;
  action?: string;
  correlationId?: string;
};

export default async function AccessDeniedPage({
  searchParams
}: {
  searchParams?: Promise<DenialParams>;
}) {
  const params = (await searchParams) ?? {};
  const resource = safeBusinessLabel(params.resource, "the requested workspace");
  const action = safeBusinessLabel(params.action, "complete this action");
  const decision = denialContent(params.reasonCode, action, resource);
  const correlationId = safeSupportValue(params.correlationId) ?? createCorrelationId();
  const requestOptionsHref = `/auth/request-access?resource=${encodeURIComponent(resource)}&action=${encodeURIComponent(action)}&correlationId=${encodeURIComponent(correlationId)}`;

  return (
    <AuthBoundaryLayout>
      <AuthStatePanel
        eyebrow="Authorization decision"
        title={decision.title}
        summary={decision.summary}
        wide
      >
        <DestinationSummary>Protected resource: {resource}</DestinationSummary>

        <div className="auth-gateway__actions">
          <a className="auth-gateway__primary-action" href="/">Return to workspace</a>
          {decision.contextVerified ? (
            <a
              className="auth-gateway__secondary-action"
              data-testid="request-access-link"
              href={requestOptionsHref}
            >
              Access request options
            </a>
          ) : null}
        </div>

        <p className="auth-gateway__support-note">
          Repeating the action will not change this access decision. Your administrator can review your assigned role if needed.
        </p>

        <SupportDetails
          items={[
            { term: "Decision", description: decision.technicalStatus },
            { term: "Request ID", description: correlationId },
            { term: "Time", description: new Date().toISOString() }
          ]}
        />
      </AuthStatePanel>
    </AuthBoundaryLayout>
  );
}

function denialContent(reasonCode: string | undefined, action: string, resource: string) {
  switch (reasonCode) {
    case "DENY_NO_PERMISSION":
      return {
        title: `You cannot ${action}`,
        summary: `This action is not included in your current access for ${resource}.`,
        technicalStatus: "Missing permission",
        contextVerified: true
      };
    case "DENY_SCOPE":
    case "DENY_SCOPE_MISMATCH":
      return {
        title: "This record is outside your assigned scope",
        summary: "Your account is not assigned to the business scope required for this record.",
        technicalStatus: "Business scope mismatch",
        contextVerified: true
      };
    case "DENY_PERMISSION_CHANGED":
      return {
        title: "Your access changed",
        summary: "This action is no longer available. No record changes were made.",
        technicalStatus: "Permission changed",
        contextVerified: true
      };
    default:
      return {
        title: "We could not verify this access decision",
        summary: "The link may be incomplete or expired. No protected record information is displayed.",
        technicalStatus: "Unverified decision context",
        contextVerified: false
      };
  }
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

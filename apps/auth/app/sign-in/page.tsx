import {
  AuthBoundaryLayout,
  AuthNotice,
  AuthStatePanel,
  DestinationSummary,
  SupportDetails
} from "../AuthBoundary";
import { GatewayAction } from "../GatewayAction";
import {
  gatewayEntryHref,
  gatewaySignInHref,
  resolveGatewayDestination
} from "../../lib/auth-gateway";

type HandoffStatus = "cancelled" | "expired" | "failed" | "unavailable";
type SearchParams = {
  returnUrl?: string;
  status?: string;
};

export default async function SignInPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const destination = resolveGatewayDestination(params.returnUrl);
  const status = handoffStatus(params.status);
  const content = handoffContent(status, destination.label);
  const environmentLabel = process.env.LINERCORE_ENVIRONMENT_LABEL ?? "LOCAL DEMO";
  const showTechnicalDetails = environmentLabel !== "PRODUCTION";
  const actionHref = gatewaySignInHref(destination.href);

  return (
    <AuthBoundaryLayout>
      <AuthStatePanel eyebrow={content.eyebrow} title={content.title} summary={content.summary}>
        <DestinationSummary>Return to {destination.label}.</DestinationSummary>

        {destination.invalid ? (
          <AuthNotice title="We couldn't use that destination.">
            For your security, the LinerCore workspace will be used instead.
          </AuthNotice>
        ) : null}

        {status === "unavailable" ? (
          <AuthNotice title="Company sign-in is unavailable." tone="error">
            Try again shortly. No protected information has been displayed.
          </AuthNotice>
        ) : null}

        <div className="auth-gateway__actions">
          <GatewayAction
            dataTestId="sign-in-button"
            href={actionHref}
            label={content.actionLabel}
            pendingLabel={content.pendingLabel}
          />
          <a className="auth-gateway__secondary-action" href={gatewayEntryHref(destination.href)}>
            Cancel
          </a>
        </div>

        {showTechnicalDetails ? (
          <SupportDetails
            items={[
              { term: "Environment", description: environmentLabel },
              { term: "Destination", description: destination.label },
              { term: "Handoff", description: status ? content.technicalStatus : "Ready" }
            ]}
          />
        ) : null}
      </AuthStatePanel>
    </AuthBoundaryLayout>
  );
}

function handoffStatus(value: string | undefined): HandoffStatus | null {
  if (value === "cancelled" || value === "expired" || value === "failed" || value === "unavailable") {
    return value;
  }
  return null;
}

function handoffContent(status: HandoffStatus | null, destinationLabel: string) {
  if (status === "expired") {
    return {
      eyebrow: "Sign-in request expired",
      title: "Your sign-in request expired",
      summary: `Start a new secure sign-in to continue to ${destinationLabel}.`,
      actionLabel: "Start again",
      pendingLabel: "Opening company sign-in...",
      technicalStatus: "Expired"
    };
  }

  if (status === "cancelled") {
    return {
      eyebrow: "Sign-in cancelled",
      title: "Sign-in was cancelled",
      summary: `You can continue when you're ready to return to ${destinationLabel}.`,
      actionLabel: "Continue to sign in",
      pendingLabel: "Opening company sign-in...",
      technicalStatus: "Cancelled"
    };
  }

  if (status === "failed") {
    return {
      eyebrow: "Sign-in interrupted",
      title: "Sign-in did not complete",
      summary: `Try the secure company sign-in again to continue to ${destinationLabel}.`,
      actionLabel: "Try again",
      pendingLabel: "Opening company sign-in...",
      technicalStatus: "Failed"
    };
  }

  if (status === "unavailable") {
    return {
      eyebrow: "Company access",
      title: "Sign-in is temporarily unavailable",
      summary: "LinerCore couldn't reach the company identity service.",
      actionLabel: "Try again",
      pendingLabel: "Opening company sign-in...",
      technicalStatus: "Unavailable"
    };
  }

  return {
    eyebrow: "Secure company access",
    title: "Continue to company sign-in",
    summary: "You'll sign in with your company account and return to the requested LinerCore workspace.",
    actionLabel: "Continue to sign in",
    pendingLabel: "Opening company sign-in...",
    technicalStatus: "Ready"
  };
}

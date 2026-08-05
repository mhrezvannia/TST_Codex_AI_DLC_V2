import {
  AuthBoundaryLayout,
  AuthNotice,
  AuthStatePanel,
  DestinationSummary,
  SupportDetails
} from "../AuthBoundary";
import { GatewayAction, GatewayPostAction } from "../GatewayAction";
import { gatewayEntryHref, resolveGatewayDestination } from "../../lib/auth-gateway";

type SignOutReason = "already" | "expired" | "failed" | "idp_incomplete" | "invalid";
type SearchParams = {
  reason?: string;
  returnUrl?: string;
};

export default async function SignedOutPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const destination = resolveGatewayDestination(params.returnUrl);
  const reason = signOutReason(params.reason);
  const content = signedOutContent(reason, destination.label);
  const environmentLabel = process.env.LINERCORE_ENVIRONMENT_LABEL ?? "LOCAL DEMO";
  const showTechnicalDetails = environmentLabel !== "PRODUCTION";

  return (
    <AuthBoundaryLayout>
      <AuthStatePanel eyebrow={content.eyebrow} title={content.title} summary={content.summary}>
        {reason === "expired" || reason === "invalid" ? (
          <DestinationSummary>Sign in again to continue to {destination.label}.</DestinationSummary>
        ) : null}

        {destination.invalid ? (
          <AuthNotice title="We couldn't use the previous destination.">
            Sign-in will return to the LinerCore workspace instead.
          </AuthNotice>
        ) : null}

        {reason === "idp_incomplete" ? (
          <AuthNotice title="Company single sign-on may still be active.">
            The LinerCore application session is cleared, but another company application may still recognize you.
          </AuthNotice>
        ) : null}

        {reason === "failed" ? (
          <GatewayPostAction
            action="/auth/api/auth/sign-out"
            dataTestId="signed-out-retry-link"
            label="Try sign out again"
            pendingLabel="Signing out..."
          />
        ) : (
          <GatewayAction
            dataTestId="signed-out-sign-in-link"
            href={gatewayEntryHref(destination.href)}
            label="Sign in again"
            pendingLabel="Opening secure access..."
          />
        )}

        {showTechnicalDetails ? (
          <SupportDetails
            items={[
              { term: "Environment", description: environmentLabel },
              { term: "Session outcome", description: content.technicalStatus },
              { term: "Destination", description: destination.label }
            ]}
          />
        ) : null}
      </AuthStatePanel>
    </AuthBoundaryLayout>
  );
}

function signOutReason(value: string | undefined): SignOutReason | null {
  if (
    value === "already" ||
    value === "expired" ||
    value === "failed" ||
    value === "idp_incomplete" ||
    value === "invalid"
  ) {
    return value;
  }
  return null;
}

function signedOutContent(reason: SignOutReason | null, destinationLabel: string) {
  if (reason === "expired") {
    return {
      eyebrow: "Session expired",
      title: "Your workspace session ended",
      summary: `Your session expired before LinerCore could open ${destinationLabel}.`,
      technicalStatus: "Expired"
    };
  }

  if (reason === "invalid") {
    return {
      eyebrow: "Session ended",
      title: "Your workspace session ended",
      summary: "LinerCore couldn't verify the previous session, so protected workspace data was cleared.",
      technicalStatus: "Invalid"
    };
  }

  if (reason === "failed") {
    return {
      eyebrow: "Sign-out interrupted",
      title: "Sign-out did not complete",
      summary: "LinerCore couldn't confirm that the application session was cleared.",
      technicalStatus: "Failed"
    };
  }

  if (reason === "idp_incomplete") {
    return {
      eyebrow: "Application session cleared",
      title: "You are signed out of LinerCore",
      summary: "Your LinerCore application session was cleared.",
      technicalStatus: "Identity-provider sign-out incomplete"
    };
  }

  if (reason === "already") {
    return {
      eyebrow: "No active session",
      title: "You are already signed out",
      summary: "There is no active LinerCore application session in this browser.",
      technicalStatus: "Already signed out"
    };
  }

  return {
    eyebrow: "Session cleared",
    title: "You are signed out",
    summary: "Your LinerCore application session was cleared.",
    technicalStatus: "Signed out"
  };
}

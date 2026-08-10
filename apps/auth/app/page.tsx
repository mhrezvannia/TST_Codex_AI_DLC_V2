import { headers } from "next/headers";
import {
  AuthBoundaryLayout,
  AuthNotice,
  AuthStatePanel,
  DestinationSummary,
  SupportDetails
} from "./AuthBoundary";
import { GatewayAction } from "./GatewayAction";
import {
  gatewayEntryHref,
  gatewaySignInHref,
  identityServiceAvailable,
  resolveGatewayDestination,
  resolveGatewaySession
} from "../lib/auth-gateway";

type SearchParams = {
  returnUrl?: string;
};

export default async function AuthHomePage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const [params, headerStore, identityAvailable] = await Promise.all([
    searchParams ?? Promise.resolve<SearchParams>({}),
    headers(),
    identityServiceAvailable()
  ]);
  const destination = resolveGatewayDestination(params.returnUrl);
  const sessionState = resolveGatewaySession(headerStore.get("cookie"));
  const environmentLabel = process.env.LINERCORE_ENVIRONMENT_LABEL ?? "LOCAL DEMO";
  const showTechnicalDetails = environmentLabel !== "PRODUCTION";
  const requestId = headerStore.get("x-correlation-id") ?? "Not available";

  const content = gatewayContent(sessionState, destination.label, identityAvailable);
  const actionHref = identityAvailable
    ? sessionState.kind === "active"
      ? destination.href
      : gatewaySignInHref(destination.href)
    : gatewayEntryHref(destination.href);

  return (
    <AuthBoundaryLayout>
      <AuthStatePanel eyebrow="Secure company access" title={content.title} summary={content.summary}>
        {content.destinationCopy ? <DestinationSummary>{content.destinationCopy}</DestinationSummary> : null}

        {destination.invalid ? (
          <AuthNotice title="We couldn't use that destination.">
            For your security, you&apos;ll continue to the LinerCore workspace instead.
          </AuthNotice>
        ) : null}

        <GatewayAction
          dataTestId="auth-start-link"
          href={actionHref}
          label={content.actionLabel}
          pendingLabel={content.pendingLabel}
        />

        {showTechnicalDetails ? (
          <SupportDetails
            items={[
              { term: "Environment", description: environmentLabel },
              { term: "Session", description: sessionLabel(sessionState.kind) },
              { term: "Identity service", description: identityAvailable ? "Available" : "Unavailable" },
              { term: "Destination", description: destination.label },
              { term: "Request ID", description: requestId }
            ]}
          />
        ) : null}
      </AuthStatePanel>
    </AuthBoundaryLayout>
  );
}

function gatewayContent(
  sessionState: ReturnType<typeof resolveGatewaySession>,
  destinationLabel: string,
  identityAvailable: boolean
) {
  if (!identityAvailable) {
    return {
      title: "Workspace access is temporarily unavailable",
      summary: "We can't verify your access right now. No changes have been made.",
      destinationCopy: null,
      actionLabel: "Try again",
      pendingLabel: "Checking access..."
    };
  }

  if (sessionState.kind === "active") {
    return {
      title: sessionState.session.displayName ? `Welcome back, ${sessionState.session.displayName}` : "Welcome back",
      summary: "Your company session is active.",
      destinationCopy: `Continue to ${destinationLabel}.`,
      actionLabel: destinationLabel === "LinerCore workspace" ? "Continue to workspace" : `Continue to ${destinationLabel}`,
      pendingLabel: destinationLabel === "LinerCore workspace" ? "Opening workspace..." : `Opening ${destinationLabel}...`
    };
  }

  if (sessionState.kind === "expired") {
    return {
      title: "Your session has expired",
      summary: `Sign in again to continue to ${destinationLabel}.`,
      destinationCopy: null,
      actionLabel: "Sign in again",
      pendingLabel: "Opening secure sign in..."
    };
  }

  return {
    title: "Sign in to LinerCore",
    summary: "Use your company account to access LinerCore securely.",
    destinationCopy:
      destinationLabel === "LinerCore workspace"
        ? "After sign-in, you'll continue to the LinerCore workspace."
        : `After sign-in, you'll continue to ${destinationLabel}.`,
    actionLabel: "Sign in",
    pendingLabel: "Opening secure sign in..."
  };
}

function sessionLabel(kind: ReturnType<typeof resolveGatewaySession>["kind"]) {
  if (kind === "active") return "Active";
  if (kind === "expired") return "Expired";
  return "Not detected";
}

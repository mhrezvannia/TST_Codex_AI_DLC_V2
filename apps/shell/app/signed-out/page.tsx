import { redirect } from "next/navigation";

const SIGN_OUT_REASONS = new Set(["already", "expired", "failed", "idp_incomplete", "invalid"]);

export default async function ShellSignedOutPage({
  searchParams
}: {
  searchParams?: Promise<{ reason?: string; returnUrl?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const canonicalParams = new URLSearchParams();

  if (params.reason && SIGN_OUT_REASONS.has(params.reason)) {
    canonicalParams.set("reason", params.reason);
  }
  if (params.returnUrl) {
    canonicalParams.set("returnUrl", params.returnUrl);
  }

  const query = canonicalParams.toString();
  redirect(query ? `/auth/signed-out?${query}` : "/auth/signed-out");
}

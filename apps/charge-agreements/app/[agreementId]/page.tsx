import { AgreementDetailView } from "../AgreementDetailView";

export default async function AgreementPage({ params }: { params: Promise<{ agreementId: string }> }) {
  const { agreementId } = await params;
  return <AgreementDetailView agreementId={agreementId} />;
}

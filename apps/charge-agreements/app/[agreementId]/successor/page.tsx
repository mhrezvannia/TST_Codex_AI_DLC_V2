import { AgreementFormLoader } from "../../AgreementFormLoader";

export default async function SuccessorAgreementPage({ params }: { params: Promise<{ agreementId: string }> }) {
  const { agreementId } = await params;
  return <main className="rates-page"><header><p className="rates-eyebrow">Agreement authority / successor</p><h1 className="rates-title">Create successor Draft</h1></header><AgreementFormLoader agreementId={agreementId} mode="successor" /></main>;
}

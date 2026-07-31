import { AgreementFormLoader } from "../../../AgreementFormLoader";

export default async function EditAgreementPage({ params }: { params: Promise<{ agreementId: string }> }) {
  const { agreementId } = await params;
  return <main className="rates-page"><header><p className="rates-eyebrow">Agreement authority / Draft</p><h1 className="rates-title">Edit Agreement Draft</h1></header><AgreementFormLoader agreementId={agreementId} mode="edit" /></main>;
}

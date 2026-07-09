import { ChargeAgreementWorkbench } from "./ChargeAgreementWorkbench";
import { skeletonAgreements, skeletonRuntimeStatus } from "../lib/charge-agreements";

export default function ChargeAgreementsHomePage() {
  return (
    <ChargeAgreementWorkbench
      initialAgreements={skeletonAgreements}
      initialStatus={skeletonRuntimeStatus}
    />
  );
}

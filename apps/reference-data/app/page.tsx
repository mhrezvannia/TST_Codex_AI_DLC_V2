import { ReferenceDataWorkbench } from "./ReferenceDataWorkbench";
import {
  defaultPermissionState,
  listRecords,
  referenceSetDescriptors
} from "../lib/reference-data";

export default function ReferenceDataHomePage() {
  return (
    <ReferenceDataWorkbench
      initialSets={referenceSetDescriptors}
      initialRecords={listRecords(null)}
      initialPermissions={defaultPermissionState("ref-ui-demo")}
    />
  );
}

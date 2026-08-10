import { Card } from "@erp/ui";
import { RateFormEditor } from "../RateForm";

export default function NewRatePage() {
  return (
    <main className="rates-page">
      <header>
        <p className="rates-eyebrow">Rate authority / create</p>
        <h1 className="rates-title">Create Rate Draft</h1>
        <p className="rates-muted">References are revalidated by the authority service at save and approval.</p>
      </header>
      <Card><RateFormEditor /></Card>
    </main>
  );
}

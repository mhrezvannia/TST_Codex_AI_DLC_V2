export default function ReferenceDataAccessDeniedPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Access denied</h1>
      <p data-testid="denied-area">Requested area: reference-data</p>
      <p data-testid="denied-correlation">Correlation id: ref-denied-local</p>
      <a data-testid="denied-request-access" href="/request-access">
        Request access
      </a>
    </main>
  );
}

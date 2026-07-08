export default async function RequestAccessPage({
  searchParams
}: {
  searchParams?: Promise<{ resource?: string; action?: string; correlationId?: string }>;
}) {
  const params = await searchParams;
  const resource = params?.resource ?? "Shared Platform";
  const action = params?.action ?? "access";
  return (
    <main>
      <h1>Request access</h1>
      <form action="/api/auth/request-access" method="post">
        <input type="hidden" name="requestedResource" value={resource} />
        <input type="hidden" name="requestedAction" value={action} />
        <label htmlFor="message">Message</label>
        <textarea data-testid="request-access-message" id="message" name="message" />
        <button data-testid="request-access-submit" type="submit">
          Submit request
        </button>
      </form>
    </main>
  );
}

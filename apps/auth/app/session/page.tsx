export default function SessionPage() {
  return (
    <main>
      <h1>Current Session</h1>
      <p>Your session summary is loaded through the server-side BFF.</p>
      <a data-testid="session-json-link" href="/api/auth/session">
        View safe session JSON
      </a>
      <form action="/api/auth/sign-out" method="post">
        <button data-testid="sign-out-button" type="submit">
          Sign out
        </button>
      </form>
    </main>
  );
}

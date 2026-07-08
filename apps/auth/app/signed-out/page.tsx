export default function SignedOutPage() {
  return (
    <main>
      <h1>Signed out</h1>
      <p>Your Shared Platform session has been cleared.</p>
      <a data-testid="signed-out-sign-in-link" href="/sign-in">
        Sign in again
      </a>
    </main>
  );
}

export default function AuthHomePage() {
  return (
    <main>
      <h1>Shared Platform Auth</h1>
      <p>Sign in with your internal carrier identity to continue.</p>
      <a data-testid="auth-start-link" href="/sign-in">
        Sign in
      </a>
    </main>
  );
}

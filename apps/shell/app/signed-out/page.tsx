export default function ShellSignedOutPage() {
  return (
    <main className="shell-signed-out" data-testid="shell-signed-out-page">
      <section className="shell-state">
        <p className="shell-eyebrow">Session cleared</p>
        <h1>Signed out</h1>
        <p className="shell-muted">Your LinerCore session has ended. Protected workspace routes require sign-in again.</p>
        <a className="shell-button shell-button-primary" href="/auth/sign-in" data-testid="shell-signed-out-sign-in">
          Sign in again
        </a>
      </section>
    </main>
  );
}

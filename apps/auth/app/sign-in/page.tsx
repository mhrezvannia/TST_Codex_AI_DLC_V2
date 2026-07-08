export default async function SignInPage({ searchParams }: { searchParams?: Promise<{ returnUrl?: string }> }) {
  const params = await searchParams;
  const returnUrl = params?.returnUrl ?? "/session";
  return (
    <main>
      <h1>Sign in</h1>
      <p>Use your internal carrier account.</p>
      <a data-testid="sign-in-button" href={`/api/auth/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`}>
        Continue with Keycloak
      </a>
    </main>
  );
}

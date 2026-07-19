export function POST() {
  return new Response(null, {
    status: 307,
    headers: {
      Location: "/auth/api/auth/sign-out"
    }
  });
}

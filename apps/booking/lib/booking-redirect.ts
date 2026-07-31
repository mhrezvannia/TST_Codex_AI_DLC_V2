const LIST_QUERY_KEYS = ["page", "pageSize", "sort", "direction", "status", "q"] as const;

export type BookingRedirectDecision = { destination: URL; status: 308 };

export function canonicalShellOrigin(): URL {
  const configured = process.env.SHELL_PUBLIC_URL ?? "http://127.0.0.1:8088";
  const origin = new URL(configured);
  if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password) {
    throw new Error("SHELL_PUBLIC_URL must be a trusted HTTP(S) origin");
  }
  return new URL(origin.origin);
}

export function canonicalBookingRedirect(request: Request, canonicalOrigin: URL): BookingRedirectDecision | null {
  const source = new URL(request.url);
  if (source.pathname.startsWith("/api/")) return null;
  const destination = new URL("/booking", canonicalOrigin);

  if (source.pathname === "/bookings") {
    for (const key of LIST_QUERY_KEYS) {
      const value = source.searchParams.getAll(key).find((candidate) => candidate.length > 0);
      if (value) destination.searchParams.set(key, value);
    }
  } else if (source.pathname === "/bookings/new") {
    destination.pathname = "/booking/new";
  } else if (source.pathname.startsWith("/bookings/")) {
    const rawId = source.pathname.slice("/bookings/".length);
    const id = safeBookingId(rawId);
    if (id) {
      destination.pathname = `/booking/${encodeURIComponent(id)}`;
      if (source.searchParams.get("created") === "1") destination.searchParams.set("created", "1");
    }
  } else {
    return null;
  }
  return { destination, status: 308 };
}

function safeBookingId(rawId: string): string | null {
  if (!rawId || rawId.length > 160 || rawId.includes("/") || /%2f|%5c/i.test(rawId)) return null;
  let id: string;
  try { id = decodeURIComponent(rawId); } catch { return null; }
  if (!id || id === "." || id === ".." || id.includes("..") || id.includes("/") || id.includes("\\")) return null;
  return /^[A-Za-z0-9._:-]+$/.test(id) ? id : null;
}

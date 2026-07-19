const LIST_QUERY_KEYS = ["page", "pageSize", "sort", "direction", "status", "q"] as const;
type SearchInput = Record<string, string | string[] | undefined> | URLSearchParams;

export function canonicalBookingListPath(searchParams: SearchInput): string {
  const query = new URLSearchParams();
  for (const key of LIST_QUERY_KEYS) {
    const value = firstValue(searchParams, key);
    if (value) {
      query.set(key, value);
    }
  }
  const suffix = query.toString();
  return suffix ? `/booking?${suffix}` : "/booking";
}

export function canonicalBookingNewPath(): string {
  return "/booking/new";
}

export function canonicalBookingDetailPath(rawId: string | undefined): string | null {
  const id = decodeLegacyBookingId(rawId);
  return id ? `/booking/${encodeURIComponent(id)}` : null;
}

function firstValue(searchParams: SearchInput, key: string): string | null {
  if (searchParams instanceof URLSearchParams) {
    return searchParams.getAll(key).find((value) => value.length > 0) ?? null;
  }
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value.find((entry) => entry.length > 0) ?? null;
  }
  return value && value.length > 0 ? value : null;
}

function decodeLegacyBookingId(rawId: string | undefined): string | null {
  if (!rawId || rawId.length > 160 || /%2f|%5c/i.test(rawId)) {
    return null;
  }
  let decoded: string;
  try {
    decoded = decodeURIComponent(rawId);
  } catch {
    return null;
  }
  if (!decoded || decoded === "." || decoded === ".." || decoded.includes("..")) {
    return null;
  }
  if (decoded.includes("/") || decoded.includes("\\") || /%2f|%5c/i.test(decoded)) {
    return null;
  }
  return /^[A-Za-z0-9._:-]+$/.test(decoded) ? decoded : null;
}

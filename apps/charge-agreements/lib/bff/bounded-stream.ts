export class BoundedStreamError extends Error {
  readonly code: "BODY_TOO_LARGE" | "UTF8_INVALID" | "BODY_UNAVAILABLE";

  constructor(code: "BODY_TOO_LARGE" | "UTF8_INVALID" | "BODY_UNAVAILABLE") {
    super(code);
    this.name = "BoundedStreamError";
    this.code = code;
  }
}

export async function readBoundedBytes(
  body: ReadableStream<Uint8Array> | null,
  maximumBytes: number,
  declaredLength?: string | null,
  signal?: AbortSignal
): Promise<Uint8Array> {
  if (!Number.isInteger(maximumBytes) || maximumBytes < 0) {
    throw new BoundedStreamError("BODY_UNAVAILABLE");
  }
  if (declaredLength && /^\d+$/.test(declaredLength)
    && Number(declaredLength) > maximumBytes) {
    throw new BoundedStreamError("BODY_TOO_LARGE");
  }
  if (!body) return new Uint8Array();
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  let aborted = false;
  const abort = () => {
    aborted = true;
    void reader.cancel("request cancelled").catch(() => undefined);
  };
  if (signal?.aborted) abort();
  else signal?.addEventListener("abort", abort, { once: true });
  try {
    while (true) {
      if (aborted || signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const { done, value } = await reader.read();
      if (aborted || signal?.aborted) throw new DOMException("Aborted", "AbortError");
      if (done) break;
      total += value.byteLength;
      if (total > maximumBytes) {
        void reader.cancel("body limit exceeded").catch(() => undefined);
        throw new BoundedStreamError("BODY_TOO_LARGE");
      }
      chunks.push(value);
    }
  } finally {
    signal?.removeEventListener("abort", abort);
    if (aborted) void reader.cancel("request cancelled").catch(() => undefined);
    reader.releaseLock();
  }
  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}

export function decodeUtf8Fatal(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new BoundedStreamError("UTF8_INVALID");
  }
}

export async function readBoundedJson(
  body: ReadableStream<Uint8Array> | null,
  maximumBytes: number,
  declaredLength?: string | null,
  signal?: AbortSignal
): Promise<unknown> {
  const text = decodeUtf8Fatal(await readBoundedBytes(body, maximumBytes, declaredLength, signal));
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new SyntaxError("JSON_INVALID");
  }
}

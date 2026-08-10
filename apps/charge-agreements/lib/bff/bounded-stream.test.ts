import {
  BoundedStreamError,
  decodeUtf8Fatal,
  readBoundedBytes,
  readBoundedJson
} from "./bounded-stream";

describe("bounded stream ownership", () => {
  it("reads a bounded multi-chunk body", async () => {
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("ab"));
        controller.enqueue(new TextEncoder().encode("cd"));
        controller.close();
      }
    });
    expect(new TextDecoder().decode(await readBoundedBytes(body, 4))).toBe("abcd");
  });

  it("rejects declared and streamed overflow", async () => {
    await expect(readBoundedBytes(null, 2, "3"))
      .rejects.toEqual(new BoundedStreamError("BODY_TOO_LARGE"));
    await expect(readBoundedBytes(new Response("abc").body, 2))
      .rejects.toMatchObject({ code: "BODY_TOO_LARGE" });
  });

  it("uses fatal UTF-8 and strict JSON parsing", async () => {
    expect(() => decodeUtf8Fatal(Uint8Array.of(0xff))).toThrowError("UTF8_INVALID");
    await expect(readBoundedJson(new Response("{").body, 10)).rejects.toThrowError("JSON_INVALID");
  });

  it("cancels and settles a reader whose read is pending when aborted", async () => {
    const abort = new AbortController();
    let cancelled: (reason: unknown) => void = () => undefined;
    const cancellation = new Promise<unknown>((resolve) => {
      cancelled = resolve;
    });
    const body = new ReadableStream<Uint8Array>({
      pull: () => new Promise<void>(() => undefined),
      cancel: (reason) => cancelled(reason)
    });

    const pending = readBoundedBytes(body, 16, null, abort.signal);
    await Promise.resolve();
    abort.abort("browser disconnected");

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    await expect(cancellation).resolves.toBe("request cancelled");
  });
});

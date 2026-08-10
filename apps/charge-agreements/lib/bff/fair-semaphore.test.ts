import { FairSemaphore, FairSemaphoreCapacityError } from "./fair-semaphore";

describe("fair bounded admission", () => {
  it("hands permits off in FIFO order and ignores double release", async () => {
    const pool = new FairSemaphore(1, 2);
    const first = await pool.acquire(100);
    const order: number[] = [];
    const second = pool.acquire(100).then((lease) => { order.push(2); return lease; });
    const third = pool.acquire(100).then((lease) => { order.push(3); return lease; });
    first!.release();
    const secondLease = await second;
    secondLease!.release();
    const thirdLease = await third;
    thirdLease!.release();
    thirdLease!.release();
    expect(order).toEqual([2, 3]);
    expect(pool.active).toBe(0);
  });

  it("times out without leaking capacity", async () => {
    vi.useFakeTimers();
    const pool = new FairSemaphore(1);
    const lease = await pool.acquire(10);
    const waiting = pool.acquire(10);
    await vi.advanceTimersByTimeAsync(11);
    expect(await waiting).toBeNull();
    lease!.release();
    expect(pool.active).toBe(0);
    vi.useRealTimers();
  });

  it("removes an aborted waiter", async () => {
    const pool = new FairSemaphore(1);
    const lease = await pool.acquire(100);
    const controller = new AbortController();
    const waiting = pool.acquire(100, controller.signal);
    controller.abort();
    expect(await waiting).toBeNull();
    expect(pool.queued).toBe(0);
    lease!.release();
  });

  it("fails fast at the explicit queue bound and recovers after handoff", async () => {
    const pool = new FairSemaphore(1, 1);
    const active = await pool.acquire(100);
    const queued = pool.acquire(100);

    await expect(pool.acquire(100)).rejects.toEqual(
      new FairSemaphoreCapacityError(1)
    );
    expect(pool.active).toBe(1);
    expect(pool.queued).toBe(1);

    active!.release();
    const handedOff = await queued;
    expect(pool.active).toBe(1);
    expect(pool.queued).toBe(0);
    handedOff!.release();

    const recovered = await pool.acquire(100);
    expect(recovered).not.toBeNull();
    recovered!.release();
    expect(pool.active).toBe(0);
  });

  it("rejects invalid queue bounds", () => {
    expect(() => new FairSemaphore(1, -1)).toThrow(
      "maximumQueued must be a non-negative integer"
    );
  });
});

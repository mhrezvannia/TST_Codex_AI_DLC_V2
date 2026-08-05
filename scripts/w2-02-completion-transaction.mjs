const combine = (prior, current, message) => prior ? new AggregateError([prior, current], message) : current;

export async function executeTerminalLastTransaction({
  initialError = null,
  prepareEnvelope,
  cleanupTraceStaging,
  releaseLifecycleLock,
  publishCompletedTerminal,
  persistFailedTerminal,
  indexCompletedNonThrowing
}) {
  let prepared = null; let terminalError = initialError;
  if (!terminalError) {
    try { prepared = await prepareEnvelope(); }
    catch (error) { terminalError = error; }
  }
  try { await cleanupTraceStaging(); }
  catch (error) { terminalError = combine(terminalError, error, "Trace staging cleanup failed terminally"); }
  try { await releaseLifecycleLock(); }
  catch (error) { terminalError = combine(terminalError, error, "Lifecycle lock release failed terminally"); }
  if (terminalError) {
    await persistFailedTerminal(terminalError);
    return { status: "FAILED", error: terminalError, prepared, completedPublished: false, indexResult: null };
  }
  try { await publishCompletedTerminal(prepared); }
  catch (error) {
    await persistFailedTerminal(error);
    return { status: "FAILED", error, prepared, completedPublished: false, indexResult: null };
  }

  // COMPLETED is now the immutable commit marker. Every subsequent operation is
  // contained here and cannot reject back into the acceptance command.
  let indexResult;
  try { indexResult = await indexCompletedNonThrowing(prepared); }
  catch (error) { indexResult = { indexed: false, recoveryFailed: true, error }; }
  return { status: "COMPLETED", error: null, prepared, completedPublished: true, indexResult };
}

import { isReadingFailureCode, ReadingRequestError } from "./readingFailure.ts";

function waitForRetry(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return; }
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, 1800);
    signal.addEventListener("abort", abort, { once: true });
  });
}

export async function requestPersonalReading(payload: unknown, signal: AbortSignal, onRetry?: () => void) {
  const body = JSON.stringify(payload);
  for (let attempt = 0; attempt < 2; attempt++) {
    signal.throwIfAborted();
    let response: Response;
    try {
      response = await fetch("/api/personalReading", {
        method: "POST", headers: { "Content-Type": "application/json" }, body,
        signal: AbortSignal.any([signal, AbortSignal.timeout(105000)]),
      });
    } catch (error) {
      if (signal.aborted) throw error;
      throw new ReadingRequestError(error instanceof Error && error.name === "TimeoutError" ? "timeout" : "network");
    }
    const data = await response.json().catch(() => null);
    if (response.ok) {
      if (!data || typeof data !== "object") throw new ReadingRequestError("incomplete");
      return data;
    }
    const code = isReadingFailureCode(data?.code) ? data.code
      : response.status === 429 ? "quota"
      : response.status === 504 ? "timeout"
      : !data && [500, 502, 503].includes(response.status) ? "busy" : "unknown";
    if (code === "busy" && attempt === 0) {
      onRetry?.();
      await waitForRetry(signal);
      continue;
    }
    throw new ReadingRequestError(code);
  }
  throw new ReadingRequestError("unknown");
}

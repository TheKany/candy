import { isReadingFailureCode, ReadingRequestError } from "./readingFailure.ts";
import { parseMonthlyReading } from "./monthlyReadingWriter.ts";
import type { MonthlyRequest, MonthlyReadingResult } from "../types/monthlyReadingTypes.ts";

function waitForRetry(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return; }
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, 1800);
    signal.addEventListener("abort", abort, { once: true });
  });
}

export async function requestPersonalReading(payload: unknown, signal: AbortSignal, onRetry?: () => void) {
  return requestReading("/api/personalReading", payload, signal, onRetry);
}

export async function requestMonthlyReading(payload: MonthlyRequest, signal: AbortSignal, onRetry?: () => void): Promise<MonthlyReadingResult> {
  const data = await requestReading("/api/monthlyReading", payload, signal, onRetry);
  try {
    const months = Array.from({ length: 13 - payload.startMonth }, (_, i) => payload.startMonth + i);
    const pages = parseMonthlyReading(data, { ...payload, months }, payload.cardIds);
    if (data.year !== payload.year || !Array.isArray(data.cards) || data.cards.length !== pages.length
      || !data.cards.every((card: { card_id?: unknown; name_ko?: unknown }, i: number) => card && card.card_id === payload.cardIds[i] && typeof card.name_ko === "string" && card.name_ko.trim())) throw new Error("Invalid cards");
    return { year: data.year, pages, cards: data.cards };
  } catch { throw new ReadingRequestError("incomplete"); }
}

async function requestReading(endpoint: "/api/personalReading" | "/api/monthlyReading", payload: unknown, signal: AbortSignal, onRetry?: () => void) {
  const body = JSON.stringify(payload);
  for (let attempt = 0; attempt < 2; attempt++) {
    signal.throwIfAborted();
    let response: Response;
    let data;
    const requestSignal = AbortSignal.any([signal, AbortSignal.timeout(105000)]);
    try {
      response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" }, body,
        signal: requestSignal,
      });
      data = await response.json().catch((error: unknown) => {
        if (error instanceof SyntaxError) return null;
        throw error;
      });
    } catch (error) {
      if (signal.aborted) throw error;
      const cause = requestSignal.aborted ? requestSignal.reason : error;
      throw new ReadingRequestError(cause instanceof Error && cause.name === "TimeoutError" ? "timeout" : "network");
    }
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

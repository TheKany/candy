// Aggregate only: no question or interpretation is sent with this request.
export async function recordTarotStart() {
  try {
    const response = await fetch('/api/countUsers', { method: 'POST', keepalive: true });
    if (!response.ok) console.warn('Tarot start count was not recorded.');
  } catch {
    // Counting must not block a reading. Do not retry an ambiguous write.
    console.warn('Tarot start count could not be sent.');
  }
}

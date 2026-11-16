/** Fetch resolves even for HTTP errors. Never announce a save before checking it. */
export async function checkedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'La modification n’a pas été enregistrée. Veuillez réessayer.');
  }
  return response;
}

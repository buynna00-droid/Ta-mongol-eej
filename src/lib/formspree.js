/**
 * Minimal Formspree client (no extra dependency).
 *
 * Formspree treats a request as AJAX when it carries `Accept: application/json`
 * and then answers with JSON: `{ ok: true, … }` on success, or `{ errors: […] }`
 * with a 4xx status on failure (429 when the rate limit is hit).
 * A success is reported ONLY for a 2xx JSON answer without errors; anything
 * else (e.g. an HTML page returned when reCAPTCHA is still enabled on the form)
 * is treated as a failure, so a visitor is never told their data was sent when
 * it was not.
 */
export class SubmissionError extends Error {
  constructor(kind, details) {
    super(`Formspree submission failed: ${kind}`)
    this.name = 'SubmissionError'
    this.kind = kind
    this.details = details
  }
}

export async function submitToFormspree(endpoint, payload, { signal } = {}) {
  let response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal
    })
  } catch (error) {
    if (error && error.name === 'AbortError') throw new SubmissionError('timeout', error)
    throw new SubmissionError('network', error)
  }

  const body = await response.json().catch(() => null)
  if (response.ok && body && typeof body === 'object' && body.ok !== false && !body.errors) {
    return body
  }

  const details = { status: response.status, errors: body?.errors ?? body?.error ?? null }
  if (response.status === 429) throw new SubmissionError('rateLimit', details)
  if (response.status >= 500) throw new SubmissionError('server', details)
  throw new SubmissionError('rejected', details)
}

import test from 'node:test'
import assert from 'node:assert/strict'
import { submitToFormspree } from './formspree.js'

test('only explicit service confirmation counts as a successful registration', async () => {
  const originalFetch = globalThis.fetch
  try {
    for (const body of [{}, [], { error: 'Rejected' }, { ok: false }, { ok: true, errors: ['Rejected'] }]) {
      globalThis.fetch = async () => Response.json(body)
      await assert.rejects(submitToFormspree('https://example.invalid', {}), { kind: 'rejected' })
    }
    globalThis.fetch = async () => Response.json({ ok: true })
    assert.deepEqual(await submitToFormspree('https://example.invalid', {}), { ok: true })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('service and transport failures preserve their actionable error category', async () => {
  const originalFetch = globalThis.fetch
  try {
    for (const [status, kind] of [[429, 'rateLimit'], [503, 'server'], [400, 'rejected']]) {
      globalThis.fetch = async () => Response.json({ errors: ['Unavailable'] }, { status })
      await assert.rejects(submitToFormspree('https://example.invalid', {}), { kind })
    }
    globalThis.fetch = async () => new Response('<html>Login required</html>')
    await assert.rejects(submitToFormspree('https://example.invalid', {}), { kind: 'rejected' })
    globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
    await assert.rejects(submitToFormspree('https://example.invalid', {}), { kind: 'network' })
    globalThis.fetch = async () => { throw new DOMException('Aborted', 'AbortError') }
    await assert.rejects(submitToFormspree('https://example.invalid', {}), { kind: 'timeout' })
  } finally {
    globalThis.fetch = originalFetch
  }
})

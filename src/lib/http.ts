export class HttpError extends Error {
  status: number
  statusText: string
  url: string
  body?: string
  constructor(message: string, opts: { status: number; statusText: string; url: string; body?: string }) {
    super(message)
    this.name = 'HttpError'
    this.status = opts.status
    this.statusText = opts.statusText
    this.url = opts.url
    this.body = opts.body
  }
}

export async function fetchJson<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const text = await res.text()

  if (!res.ok) {
    throw new HttpError(
      `HTTP ${res.status} ${res.statusText} for ${url}`,
      { status: res.status, statusText: res.statusText, url, body: text || undefined }
    )
  }

  try {
    return text ? (JSON.parse(text) as T) : ({} as T)
  } catch (err: unknown) {
    throw new Error(`Invalid JSON from ${url}: ${err instanceof Error ? err.message : String(err)}`)
  }
}

export function normalizeError(err: unknown) {
  if (err instanceof HttpError) {
    return {
      name: err.name,
      message: err.message,
      status: err.status,
      statusText: err.statusText,
      url: err.url,
      body: err.body,
    }
  }
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack }
  }
  try {
    return JSON.parse(JSON.stringify(err))
  } catch {
    return { value: String(err) }
  }
}

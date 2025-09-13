import { NextResponse } from 'next/server'

type Handler = (req: Request) => Promise<Response> | Response

export function withApiSafe(handler: Handler, options?: { routeName?: string }) {
  return async (req: Request) => {
    try {
      const res = await handler(req)
      return res
    } catch (err: unknown) {
      const detail = {
        name: err instanceof Error ? err.name : 'Error',
        message: err instanceof Error ? err.message : String(err),
        stack: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.stack : undefined) : undefined,
        route: options?.routeName,
      }
      console.error('API route error:', detail)
      return NextResponse.json({ error: detail }, { status: 500 })
    }
  }
}

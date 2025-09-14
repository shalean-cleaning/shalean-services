import { NextResponse } from 'next/server';

type Handler = (req: Request) => Promise<Response> | Response;

export function withApiSafe(handler: Handler, _opts?: { routeName?: string }): Handler {
  return async (req) => {
    try {
      const res = await handler(req);
      return res;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[API ERROR]', errorMessage, { url: req.url });
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  };
}

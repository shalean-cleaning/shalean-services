import { NextResponse } from "next/server";

type Handler = (req: Request) => Promise<Response> | Response;

export function withApiSafe(handler: Handler, _opts?: { routeName?: string }): Handler {
  return async (req) => {
    try {
      return await handler(req);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("[API ERROR]", { url: req.url, message: error?.message, stack: error?.stack });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}

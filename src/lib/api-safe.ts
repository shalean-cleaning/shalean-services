import { NextResponse } from "next/server";
type Handler = (req: Request) => Promise<Response> | Response;
export function withApiSafe(handler: Handler, _opts?: { routeName?: string }): Handler {
  return async (req) => {
    try { return await handler(req); }
    catch (err: any) {
      console.error("[API ERROR]", { url: req.url, message: err?.message, stack: err?.stack });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}

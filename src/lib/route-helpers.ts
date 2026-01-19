// src/lib/route-helpers.ts
import { z } from "zod";

export function jsonOk<T>(data: T, init: number | ResponseInit = 200) {
  const status = typeof init === "number" ? init : init.status ?? 200;
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
    ...(typeof init === "number" ? {} : init),
  });
}

export function jsonErr(message: string, status = 400) {
  return jsonOk({ error: message }, status);
}

export function assertMethod(req: Request, allowed: Array<"GET"|"POST"|"PUT"|"PATCH"|"DELETE">) {
  const m = req.method.toUpperCase();
  if (!allowed.includes(m as any)) {
    throw new Error(`Method ${m} not allowed`);
  }
}

export function parseBody<T>(data: unknown, schema: z.ZodType<T>): T {
  const r = schema.safeParse(data);
  if (!r.success) {
    const msg = r.error.issues.map(i => i.path.join(".") + ": " + i.message).join("; ");
    throw new Error(msg || "Invalid body");
  }
  return r.data;
}

/** Minimal cookie setter that works in route handlers (Response) */
export function cookie(res: Response, name: string, value: string, opts?: {
  httpOnly?: boolean; path?: string; maxAge?: number; sameSite?: "lax"|"strict"|"none"; secure?: boolean;
}) {
  const kv = [`${name}=${value}`];
  kv.push(`Path=${opts?.path ?? "/"}`);
  if (typeof opts?.maxAge === "number") kv.push(`Max-Age=${opts.maxAge}`);
  if (opts?.httpOnly) kv.push("HttpOnly");
  if (opts?.secure) kv.push("Secure");
  if (opts?.sameSite) kv.push(`SameSite=${opts.sameSite[0].toUpperCase()+opts.sameSite.slice(1)}`);
  res.headers.append("Set-Cookie", kv.join("; "));
}

/** Safe wrapper for handlers that should always return Response */
export function safeAction(fn: () => Promise<any>) {
  return (async () => {
    try {
      const data = await fn();
      return jsonOk(data);
    } catch (e: any) {
      return jsonErr(e?.message || "Bad request", 400);
    }
  })();
}

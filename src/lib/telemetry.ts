import { randomUUID } from "crypto";
import { logger } from "./logger";

export function withTimer<T>(name: string, fn: () => Promise<T> | T, ctx?: Record<string, unknown>) {
  const id = randomUUID();
  const start = Date.now();
  logger.debug(`[tm:start] ${name}`, { id, ...ctx });
  return Promise.resolve()
    .then(fn)
    .then((res) => {
      logger.info(`[tm:done] ${name}`, { id, ms: Date.now() - start, ...ctx });
      return res;
    })
    .catch((err) => {
      logger.error(`[tm:fail] ${name}`, { id, ms: Date.now() - start, err: String(err), ...ctx });
      throw err;
    });
}

export function newTraceId() {
  return randomUUID();
}

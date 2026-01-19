/* eslint-disable no-console */
type Lvl = "debug" | "info" | "warn" | "error";

const ENV = process.env.NODE_ENV || "development";
const ENABLE_DEBUG = process.env.LOG_DEBUG === "1" || ENV !== "production";

function line(level: Lvl, msg: string, meta?: unknown) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...(meta ? { meta } : {}),
  };
  const s = JSON.stringify(payload);
  if (level === "error") console.error(s);
  else if (level === "warn") console.warn(s);
  else console.log(s);
}

export const logger = {
  debug: (m: string, meta?: unknown) => ENABLE_DEBUG && line("debug", m, meta),
  info: (m: string, meta?: unknown) => line("info", m, meta),
  warn: (m: string, meta?: unknown) => line("warn", m, meta),
  error: (m: string, meta?: unknown) => line("error", m, meta),
};

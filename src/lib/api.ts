// src/lib/api.ts
// Simple typed client that calls your Next.js routes (server or client OK)

type WalletRes = { wallet: { balance: number }; history: Array<{ id: string; text: string; sub?: string }> };
type BanksRes  = { accounts: { id: string; bankName: string; last4: string; holder: string }[]; selectedId?: string };
type ItemsRes<T> = { items: T[] };

/** Build absolute URL on server, relative on client */
const isServer = typeof window === "undefined";
const API_PREFIX = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/+$/, ""); // no trailing slash
const ORIGIN = isServer ? (process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000") : "";

function url(path: string) {
  // if caller already passes absolute
  if (/^https?:\/\//i.test(path)) return path;
  // if caller passes "/api/..." keep it, else prefix with API_PREFIX
  const normalized = path.startsWith("/api/") ? path : `${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
  return `${ORIGIN}${normalized}`;
}

/** unified fetch JSON helper */
async function j<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url(path), {
    // no-store để tránh cache khi chạy server-side hoặc client gọi dữ liệu động
    cache: "no-store",
    // credentials sẽ chỉ có tác dụng ở client; ở server nếu cần cookie hãy truyền vào init.headers từ chỗ gọi
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  // cố gắng parse JSON kể cả khi lỗi
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (data as any)?.error || `HTTP ${r.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  wallet: {
    get: () => j<WalletRes>("/wallet"),
  },

  banks: {
    get: () => j<BanksRes>("/banks"),
    link: (body: { bankName: string; number: string; holder: string }) =>
      j("/banks/link", { method: "POST", body: JSON.stringify(body) }),
    select: (body: { id: string }) =>
      j("/banks/select", { method: "POST", body: JSON.stringify(body) }),
    delete: (body: { id: string }) =>
      j("/banks/delete", { method: "POST", body: JSON.stringify(body) }),
  },

  history: {
    withdrawals: {
      get: () =>
        j<ItemsRes<{ id: string; amount: number; fee: number; method: string; status: string; createdAt: string }>>(
          "/withdrawals"
        ),
    },
    commissions: {
      get: () =>
        j<ItemsRes<{ id: string; amount: number; status: string; createdAt: string }>>("/commissions"),
    },
  },

  withdraw: {
    create: (body: { amount: number; methodId: string }) =>
      j("/withdraw", { method: "POST", body: JSON.stringify(body) }),
  },

  support: {
    send: (body: { room: string; text: string }) =>
      j("/support/send", { method: "POST", body: JSON.stringify(body) }),
    chat: {
      history: (room: string) =>
        j<{ room: string; messages: { id: string; from: "agent" | "user" | "system"; text: string }[] }>(
          `/support/chat/history?room=${encodeURIComponent(room)}`
        ),
      send: (body: { room: string; text: string }) =>
        j("/support/chat/send", { method: "POST", body: JSON.stringify(body) }),
    },
  },

  auth: {
    password: {
      change: (body: { current: string; next: string }) =>
        j("/auth/password/change", { method: "POST", body: JSON.stringify(body) }),
      forgotSendOtp: (body: { email: string }) =>
        j("/auth/password/forgot/send", { method: "POST", body: JSON.stringify(body) }),
      resetWithOtp: (body: { email: string; otp: string; newPassword: string }) =>
        j("/auth/password/forgot/reset", { method: "POST", body: JSON.stringify(body) }),
    },
  },
};

export type Api = typeof api;

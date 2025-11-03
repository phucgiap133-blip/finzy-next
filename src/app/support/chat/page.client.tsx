// src/app/support/chat/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import PageContainer from "@/components/PageContainer";
import { api } from "@/lib/api";

type Sender = "agent" | "user" | "system";
type ChatMsg = { id: string; from: Sender; text: string };
type ChatHistoryResponse = { room: string; messages: ChatMsg[] };

const COMMANDS = [
  { cmd: "/rút tiền chậm", route: "/support/withdraw-slow", hint: "Nhập số tiền & thời gian giao dịch" },
  { cmd: "/giới thiệu", route: "/support/kntgt/faq", hint: "Không nhận được thưởng giới thiệu" },
  { cmd: "/đổi mật khẩu", route: "/password/change", hint: "Đổi mật khẩu đăng nhập" },
] as const;

// ✅ Chuẩn hoá tiếng Việt không dấu nhưng KHÔNG dùng \p{Diacritic}
const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu (ES5 compatible)
    .trim();

export default function SupportChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const backTo = useMemo(() => {
    const raw = searchParams.get("from") || "/support";
    try {
      const url = new URL(raw, "http://x");
      const path = url.pathname + (url.search || "");
      return path.startsWith("/support/chat") ? "/support" : path;
    } catch {
      return "/support";
    }
  }, [searchParams]);

  const [room] = useState("default");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr(null);
        const res: ChatHistoryResponse = await api.support.chat.history(room);
        if (!alive) return;
        setMessages(res.messages ?? []);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Lỗi tải lịch sử chat");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [room]);

  const showSuggestions = input.startsWith("/");
  const filtered = showSuggestions
    ? COMMANDS.filter((c) => norm(c.cmd).includes(norm(input)))
    : [];

  const onPick = (c: (typeof COMMANDS)[number]) => {
    setMessages((m) => [...m, { id: `u-${Date.now()}`, from: "user", text: c.cmd }]);
    setInput("");
    router.push(c.route);
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;

    const hit = COMMANDS.find((c) => norm(c.cmd) === norm(text));
    if (hit) {
      onPick(hit);
      return;
    }

    // optimistic UI
    setMessages((m) => [...m, { id: `u-${Date.now()}`, from: "user", text }]);
    setInput("");

    try {
      await api.support.chat.send({ room, text });
      const h: ChatHistoryResponse = await api.support.chat.history(room);
      setMessages(h.messages ?? []);
    } catch (e: any) {
      setErr(e?.message || "Không gửi được tin nhắn");
    }
  };

  return (
    <>
      {/* forceFallback: ← LUÔN về đúng `backTo` */}
      <Header title="Hỗ trợ" showBack noLine backFallback={backTo} forceFallback />

      <PageContainer className="space-y-md">
        <div className="bg-bg-card rounded-control border border-border p-md space-y-md">
          <div className="text-caption text-text-muted">CSKH 24/7</div>

          <div className="space-y-sm max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="text-caption text-text-muted">Đang tải…</div>
            ) : err ? (
              <div className="text-caption" style={{ color: "#C62828" }}>{err}</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={m.from === "agent" ? "text-left" : "text-right"}>
                  <div
                    className={`inline-block px-md py-sm rounded-control ${
                      m.from === "agent" ? "bg-[color:#F5F5F5]" : "bg-brand-primary text-white"
                    }`}
                  >
                    <span className="text-body">{m.text}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-sm">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Gõ / để xem lệnh"
                className="w-full border border-border rounded-control px-md py-sm text-body"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              {showSuggestions && (
                <div
                  className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-[12px] border border-border bg-white shadow-md overflow-hidden"
                  role="listbox"
                >
                  <div className="max-h-[280px] overflow-y-auto">
                    {filtered.length === 0 ? (
                      <div className="px-md py-sm text-caption text-text-muted">Không có lệnh phù hợp</div>
                    ) : (
                      filtered.map((c) => (
                        <button
                          key={c.cmd}
                          onClick={() => onPick(c)}
                          className="w-full text-left px-md py-sm hover:bg-[color:#FAFAFA]"
                        >
                          <div className="text-body font-medium">{c.cmd}</div>
                          <div className="text-caption text-text-muted">{c.hint}</div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={send}
              className="px-md py-sm rounded-control border border-border text-body"
              aria-label="Gửi"
            >
              ➤
            </button>
          </div>
        </div>
      </PageContainer>
    </>
  );
}

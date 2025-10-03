"use client";

import { useEffect, useState } from "react";
import { apiFetch as api } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import PageContainer from "@/components/PageContainer";

const COMMANDS = [
  { cmd: "/rút tiền chậm", route: "/support/withdraw-slow", hint: "Nhập số tiền & thời gian giao dịch" },
  { cmd: "/giới thiệu",     route: "/support/referral",     hint: "Không nhận được thưởng giới thiệu" },
  { cmd: "/đổi mật khẩu",   route: "/password/change",      hint: "Đổi mật khẩu đăng nhập" },
];

export default function SupportChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/"; // nơi quay về khi bấm back
  const [room] = useState("default");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api(`/support/chat/history?room=${encodeURIComponent(room)}`);
        if (!alive) return;
        setMessages(res?.messages || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [room]);

  const showSuggestions = input.startsWith("/");
  const filtered = showSuggestions
    ? COMMANDS.filter(c => c.cmd.toLowerCase().includes(input.toLowerCase()))
    : [];

  const onPick = (c) => {
    setMessages(m => [...m, { id: `u-${Date.now()}`, from: "user", text: c.cmd }]);
    setInput("");
    router.push(c.route);
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;

    const hit = COMMANDS.find(c => c.cmd.toLowerCase() === text.toLowerCase());
    if (hit) { onPick(hit); return; }

    setMessages(m => [...m, { id: `u-${Date.now()}`, from: "user", text }]);
    setInput("");

    try {
      await api(`/support/chat/send`, { method: "POST", body: JSON.stringify({ room, text }) });
      const h = await api(`/support/chat/history?room=${encodeURIComponent(room)}`);
      setMessages(h?.messages || []);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Header title="Hỗ trợ" showBack noLine backFallback={from} forceFallback />
      <PageContainer className="space-y-md">
        <div className="bg-bg-card rounded-control border border-border p-md space-y-md">
          <div className="text-caption text-text-muted">CSKH 24/7</div>

          <div className="space-y-sm max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="text-caption text-text-muted">Đang tải…</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={m.from === "agent" ? "text-left" : "text-right"}>
                  <div className={`inline-block px-md py-sm rounded-control ${m.from === "agent" ? "bg-[color:#F5F5F5]" : "bg-brand-primary text-white"}`}>
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
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-[12px] border border-border bg-white shadow-md overflow-hidden" role="listbox">
                  <div className="max-h-[280px] overflow-y-auto">
                    {filtered.length === 0 ? (
                      <div className="px-md py-sm text-caption text-text-muted">Không có lệnh phù hợp</div>
                    ) : (
                      filtered.map((c) => (
                        <button key={c.cmd} onClick={() => onPick(c)} className="w-full text-left px-md py-sm hover:bg-[color:#FAFAFA]">
                          <div className="text-body font-medium">{c.cmd}</div>
                          <div className="text-caption text-text-muted">{c.hint}</div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={send} className="px-md py-sm rounded-control border border-border text-body" aria-label="Gửi">
              ➤
            </button>
          </div>
        </div>
      </PageContainer>
    </>
  );
}

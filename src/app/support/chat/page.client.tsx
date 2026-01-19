// src/app/support/chat/page.client.tsx
"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Card from "@/components/Card";
import { api } from "@/lib/api";

type Sender = "agent" | "user" | "system";
type ChatMsg = { id: string; from: Sender; text: string; createdAt?: string };
type ChatHistoryResponse = { room: string; messages: ChatMsg[] };

const COMMANDS = [
  { cmd: "/rút tiền chậm", route: "/support/withdraw-slow" },
  { cmd: "/Không nhận được thưởng giới thiệu", route: "/support/kntgt/faq" },
  { cmd: "/Đổi mật khẩu", route: "/password/change-password" },
] as const;

const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatTimeLabel = (createdAt?: string) => {
  if (!createdAt) return "";
  const d = new Date(createdAt);
  const now = new Date();

  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");

  if (isSameDay(d, now)) return `${hh}:${mm}`;

  const dd = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString();
  return `${hh}:${mm}, ${dd} THG ${month}`;
};

const shouldShowTimeLabel = (prev: ChatMsg | undefined, cur: ChatMsg) => {
  if (!cur.createdAt) return false;
  const c = new Date(cur.createdAt);

  if (!prev || !prev.createdAt) return true;
  const p = new Date(prev.createdAt);

  if (!isSameDay(c, p)) return true;

  const diffMin = (c.getTime() - p.getTime()) / 60000;
  return diffMin >= 10;
};

export default function SupportChatClient() {
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
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const [isExpanded, setIsExpanded] = useState(false); // textarea cao >1 dòng
  const [showAttach, setShowAttach] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // đang thu gọn 1 dòng

  // full text + caret
  const fullInputRef = useRef<string>("");
  const cursorPositionRef = useRef({ start: 0, end: 0 });

  const autoResize = () => {
    if (!inputRef.current) return;
    const el = inputRef.current;

    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, 120);
    const final = Math.max(next, 44);
    el.style.height = `${final}px`;

    el.scrollTop = el.scrollHeight;
    setIsExpanded(final > 44);
  };

  // khoá scroll ngoài
  useEffect(() => {
    if (typeof document === "undefined") return;

    const html = document.documentElement;
    const body = document.body;

    const outer =
      (document.getElementById("app-scroll-root") as HTMLElement | null) ||
      (document.getElementById("__next") as HTMLElement | null) ||
      (body.firstElementChild as HTMLElement | null);

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevOuterOverflowY = outer?.style.overflowY ?? "";
    const prevOuterOverscroll = outer?.style.overscrollBehavior ?? "";
    const prevOuterPaddingBottom = outer?.style.paddingBottom ?? "";

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    if (outer) {
      outer.style.overflowY = "hidden";
      outer.style.overscrollBehavior = "none";
      outer.style.paddingBottom = "0px";
    }

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      if (outer) {
        outer.style.overflowY = prevOuterOverflowY;
        outer.style.overscrollBehavior = prevOuterOverscroll;
        outer.style.paddingBottom = prevOuterPaddingBottom;
      }
    };
  }, []);

  // load history
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setErr(null);
        const res: ChatHistoryResponse = await api.support.chat.history(room);
        if (!live) return;

        let msgs = res.messages ?? [];

        const hasAgent = msgs.some(
          (m) => m.from === "agent" || m.from === "system",
        );
        if (!hasAgent) {
          const welcome: ChatMsg = {
            id: "welcome",
            from: "agent",
            text: "Xin chào!\nTôi có thể giúp gì cho bạn?",
            createdAt: new Date().toISOString(),
          };
          msgs = [welcome, ...msgs];
        }

        setMessages(msgs);
      } catch (e: any) {
        if (!live) return;
        setErr(e?.message || "Lỗi tải lịch sử chat");
      } finally {
        if (live) setLoading(false);
      }
    })();

    return () => {
      live = false;
    };
  }, [room]);

  // auto scroll xuống cuối
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  useEffect(() => {
    if (!isCollapsed) autoResize();
  }, [input, isCollapsed]);

  const filtered = input.startsWith("/")
    ? COMMANDS.filter((c) => norm(c.cmd).includes(norm(input)))
    : [];

  // 🔥 Khi có lệnh → auto scroll xuống đáy để thấy list lệnh
  useEffect(() => {
    if (!listRef.current) return;
    if (filtered.length > 0) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [filtered.length]);


  // nhập text
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    const value = el.value;
    fullInputRef.current = value;

    // Trường hợp gõ đúng 1 ký tự "/" → đóng bàn phím, chỉ hiện 1 dòng như thiết kế
    if (value === "/") {
      setInput(value);
      setIsCollapsed(true);
      setIsExpanded(false);

      cursorPositionRef.current = {
        start: el.selectionStart ?? value.length,
        end: el.selectionEnd ?? value.length,
      };

      requestAnimationFrame(() => {
        el.blur();              // tắt keyboard
        el.style.height = "44px";
        el.scrollTop = 0;
      });
      return;
    }

    // các trường hợp khác: nhập bình thường, mở rộng auto
    setIsCollapsed(false);
    setInput(value);
    autoResize();
  };

  const send = async (override?: string) => {
    const raw =
      typeof override === "string"
        ? override
        : inputRef.current?.value ?? fullInputRef.current ?? input;
    const text = raw.trim();
    if (!text) return;

    const cmd = COMMANDS.find((c) => norm(c.cmd) === norm(text));
    const newMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      from: "user",
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((m) => [...m, newMsg]);
    setInput("");
    fullInputRef.current = "";
    setIsExpanded(false);
    setIsCollapsed(false);

    if (inputRef.current) {
      const el = inputRef.current;
      requestAnimationFrame(() => {
        el.value = "";
        el.style.height = "44px";
        el.focus(); // giữ bàn phím mở
      });
    }

    if (cmd) {
      router.push(cmd.route);
      return;
    }

    try {
      await api.support.chat.send({ room, text });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRootTouchMove = (e: any) => {
    if (!listRef.current) return;
    const target = e.target as Node;
    if (!listRef.current.contains(target)) {
      e.preventDefault();
    }
  };

  // click khu chat ⇒ thu gọn: chỉ giữ dòng đầu tiên
  const handleBackgroundClick = () => {
    if (showAttach) setShowAttach(false);

    if (inputRef.current && fullInputRef.current.trim()) {
      const el = inputRef.current;

      // lưu caret + full text
      cursorPositionRef.current = {
        start: el.selectionStart ?? fullInputRef.current.length,
        end: el.selectionEnd ?? fullInputRef.current.length,
      };
      fullInputRef.current = el.value;

      const firstLine = fullInputRef.current.split("\n")[0] ?? "";
      setInput(firstLine);
      el.value = firstLine; // textarea giờ chỉ có dòng 1
      el.blur(); // đóng bàn phím
      el.style.height = "44px"; // đúng 1 dòng
      el.scrollTop = 0;
      setIsCollapsed(true);
      setIsExpanded(false);
    }
  };

  // focus lại ⇒ mở full text & caret cũ
  const handleInputFocus = () => {
    if (!isCollapsed) {
      autoResize();
      return;
    }

    const full = fullInputRef.current || input;
    setIsCollapsed(false);
    setInput(full);

    if (inputRef.current) {
      const el = inputRef.current;
      requestAnimationFrame(() => {
        el.value = full;
        autoResize();
        const { start, end } = cursorPositionRef.current;
        el.setSelectionRange(start, end);
      });
    }
  };

  return (
    <div
      className="
        fixed inset-0
        flex flex-col
        bg-[#FFFEFA]
        overflow-hidden
        overscroll-none
        touch-none
      "
      onTouchMove={handleRootTouchMove}
      onClick={handleBackgroundClick}
    >
      <Header
        title="Hỗ trợ"
        showBack
        noLine
        centerTitle
        backNoBorder
        forceFallback
        backFallback={backTo}
      />

      <div className="flex-1 flex justify-center overflow-hidden">
        <div className="w-full max-w-[420px] px-[12px] pb-2 flex flex-col">
         
            {/* LIST CHAT */}
            <div
              ref={listRef}
              className="
                flex-1 min-h-0
                overflow-y-auto
                px-3 pt-6 pb-3
                touch-pan-y
                [overscroll-behavior:contain]
                [-webkit-overflow-scrolling:touch]
                [scrollbar-width:none]
                [-ms-overflow-style:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              {loading ? (
                <div className="pt-6 text-center text-[13px] text-gray-500">
                  Đang tải tin nhắn...
                </div>
              ) : err ? (
                <div className="pt-4 text-center text-[13px] text-[#DC2626]">
                  {err}
                </div>
              ) : (
                messages.map((m, index) => {
                  const isUser = m.from === "user";
                  const prev = index > 0 ? messages[index - 1] : undefined;
                  const showLabel = shouldShowTimeLabel(prev, m);

                  return (
                    <div key={m.id} className="mb-2.5">
                      <div
                        className={`flex items-end gap-2 ${
                          isUser ? "justify-end pr-1" : "justify-start pl-1"
                        }`}
                      >
                        {!isUser && (
                          <div className="w-9 h-9 -mb-[1px] rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-[15px] shadow-md flex-shrink-0">
                            ∞
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] ${
                            isUser ? "order-2" : ""
                          }`}
                        >
                          <div
                            className={[
                              "inline-block whitespace-pre-line rounded-[18px] text-[14px] leading-snug",
                              isUser
                                ? "bg-[#FFF6E5] rounded-br-[6px] px-3 py-2"
                                : "bg-white rounded-bl-[6px] border border-[#F1F1F3] px-3 py-2 shadow-sm",
                            ].join(" ")}
                          >
                            {m.text}
                          </div>
                        </div>
                      </div>

                      {showLabel && (
                        <div className="mt-1.5 text-center text-[11px] font-medium text-[#9CA3AF]">
                          {formatTimeLabel(m.createdAt)}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

{filtered.length > 0 && (
  <div className="mt-2 flex justify-center">
    {/* Card lệnh, rộng gần bằng bubble chat */}
    <div
      className="
        w-full
        mx-1                /* canh với avatar + bubble user */
        rounded-[12px]      /* bo góc 12px như thiết kế */
        bg-white
        border border-[#E5E7EB]
        overflow-hidden     /* cho border-b không lộ góc */
      "
    >
      {filtered.map((c, idx) => (
        <button
          key={c.cmd}
          type="button"
          onClick={() => send(c.cmd)}
          className={`
            flex w-full items-center
            h-12                /* 48px */
            px-4
            text-left text-[14px] font-medium text-[#111111]
            ${idx < filtered.length - 1 ? "border-b border-[#E5E7EB]" : ""}
          `}
        >
          {c.cmd}
        </button>
      ))}
    </div>
  </div>
)}

   </div>

            {/* THANH NHẬP + POPUP đính kèm */}
            <div className="px-3 pt-3 pb-3">
              <div className="relative">
                <div className="flex items-center gap-2">
                  {/* dấu + */}
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center text-[26px] text-[#111111]"
                    aria-label="Thêm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAttach((v) => !v);
                    }}
                  >
                    +
                  </button>

                  {/* popover đính kèm */}
                  {showAttach && (
                    <div
                      className="absolute bottom-12 left-0 z-20 w-[220px] rounded-[12px] border border-[#E5E7EB] bg-[#F4F6FB] shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-[14px] text-[#111111] hover:bg-white"
                        onClick={() => setShowAttach(false)} // TODO
                      >
                        <span aria-hidden>📎</span>
                        <span>Chọn ảnh từ thư viện</span>
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-[14px] text-[#111111] hover:bg-white"
                        onClick={() => setShowAttach(false)} // TODO
                      >
                        <span aria-hidden>📷</span>
                        <span>Chụp ảnh</span>
                      </button>
                    </div>
                  )}

                  {/* ô nhập */}
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Gõ / để xem lệnh"
                    className={`
                      chat-input
                      flex-1
                      bg-white
                      px-4
                      text-[14px]
                      leading-[44px]
                      outline-none
                      placeholder:text-[#C4C4C4]
                      border border-[#F0F0F0]
                      resize-none
                      ${
                        isCollapsed
                          ? "h-[44px] max-h-[44px] overflow-hidden"
                          : "min-h-[44px] max-h-[120px] overflow-y-auto"
                      }
                      ${
                        isExpanded && !isCollapsed
                          ? "rounded-[20px]"
                          : "rounded-[999px]"
                      }
                    `}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={handleInputFocus}
                  />

                  {/* nút gửi */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      send();
                      if (inputRef.current) {
                        inputRef.current.focus(); // giữ phím ảo mở
                      }
                    }}
                    className="shrink-0 flex h-10 w-10 items-center justify-center text-[20px] text-black"
                  >
                    ➤
                  </button>
                </div>
              </div>
            </div>
         
        </div>
      </div>
    </div>
  );
}

"use client";

import { MouseEvent, ReactNode } from "react";

type Props = {
  to?: string;
  subject?: string;
  body?: string;
  className?: string;
  children?: ReactNode;
};

export default function EmailSmartButton({
  to = "privacy@finzy.tech",
  subject = "Hỗ trợ khách hàng",
  body = "Xin chào, tôi cần hỗ trợ về...",
  className = "",
  children = "Gửi email",
}: Props) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const ua = typeof window !== "undefined" ? navigator.userAgent : "";
    const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(ua);

    const enc = encodeURIComponent;
    const mailto = `mailto:${to}?subject=${enc(subject)}&body=${enc(body)}`;
    const gmailWeb = `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(to)}&su=${enc(subject)}&body=${enc(body)}`;

    if (isMobile) window.location.href = mailto;
    else {
      const w = window.open(gmailWeb, "_blank", "noopener,noreferrer");
      if (!w) window.location.href = mailto;
    }
  };

  return (
    <a href={`mailto:${to}`} onClick={onClick} className={className} rel="noopener noreferrer">
      {children}
    </a>
  );
}

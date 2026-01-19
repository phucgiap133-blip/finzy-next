import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  href?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

export default function ListItem({
  href,
  title,
  subtitle,
  right,
  icon,
  active = false,
  className = "",
  titleClassName = "",
  subtitleClassName = "",
}: Props) {
  const body = (
    <div
      className={[
        "flex items-center gap-md rounded-control border border-border bg-bg-card p-md",
        active ? "shadow-md" : "shadow-sm",
        className,
      ].join(" ")}
    >
      {icon && <span className="shrink-0">{icon}</span>}

      <div className="min-w-0">
        <div className={["truncate text-body font-medium", titleClassName].join(" ")}>{title}</div>
        {subtitle && (
          <div className={["truncate text-caption text-text-muted", subtitleClassName].join(" ")}>{subtitle}</div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-sm shrink-0">
        {right ?? <span className="text-caption text-text-muted">›</span>}
      </div>
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

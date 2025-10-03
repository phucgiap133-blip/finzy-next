import Link from "next/link";

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
}) {
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
        {/* Tiêu đề dùng text-body để đồng bộ */}
        <div className={["truncate text-body font-medium", titleClassName].join(" ")}>
          {title}
        </div>

        {/* Phụ đề dùng caption theo token (không dùng text-sm) */}
        {subtitle && (
          <div className={["truncate text-caption text-text-muted", subtitleClassName].join(" ")}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Mũi tên/phần bên phải */}
      <div className="ml-auto flex items-center gap-sm shrink-0">
        {right ?? <span className="text-caption text-text-muted">›</span>}
      </div>
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

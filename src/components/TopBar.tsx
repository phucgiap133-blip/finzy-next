import Link from "next/link";
import MenuButton from "./MenuButton";

export default function TopBar({ title = "" }: { title?: string }) {
  return (
    <div className="flex items-center justify-between">
      <MenuButton />
      <div className="font-bold">{title}</div>
      <Link href="/account" aria-label="Tài khoản" className="rounded-full w-8 h-8 border border-border grid place-items-center hover:shadow-sm">
        <span className="text-brand-primary font-bold">∞</span>
      </Link>
    </div>
  );
}

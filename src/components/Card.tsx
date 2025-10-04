import { PropsWithChildren, ReactNode } from "react";

type Props = PropsWithChildren<{ title?: ReactNode }>;

export default function Card({ title, children }: Props) {
  return (
    <div className="bg-bg-card rounded-control shadow-sm p-md border border-border">
      {title && <div className="text-md font-medium mb-sm">{title}</div>}
      {children}
    </div>
  );
}

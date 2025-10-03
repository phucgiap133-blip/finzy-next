export default function Card({ title, children }) {
  return (
    <div className="bg-bg-card rounded-control shadow-sm p-md border border-border">
      {title && <div className="text-md font-medium mb-sm">{title}</div>}
      {children}
    </div>
  );
}

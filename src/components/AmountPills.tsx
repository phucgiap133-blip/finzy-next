export default function AmountPills({ amounts=[50000,100000,200000], onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-sm">
      {amounts.map(a => (
        <button key={a} onClick={()=>onSelect && onSelect(a)}
          className="rounded-control border border-border bg-bg-card px-md py-sm shadow-sm hover:shadow-md">
          {a.toLocaleString('vi-VN')}đ
        </button>
      ))}
    </div>
  );
}

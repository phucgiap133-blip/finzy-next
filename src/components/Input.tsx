type InputProps = {
  label?: string;
  type?: string;
  value?: string;
  placeholder?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; // 🟢 thêm dòng này
};

export default function Input({
  label,
  type = "text",
  value,
  placeholder,
  className = "",
  onChange,
  onBlur, // 🟢 thêm vào destructuring
}: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur} // 🟢 truyền xuống input thật
        placeholder={placeholder}
        className={`w-full rounded-md border px-3 py-2 outline-none ${className}`}
      />
    </div>
  );
}

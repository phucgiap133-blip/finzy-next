import { ReactNode, ChangeEventHandler } from "react";

type Props = {
  label?: ReactNode;
  placeholder?: string;
  type?: string;
  value?: string | number;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  error?: ReactNode;
  hint?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
};

export default function Input({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  hint,
  left,
  right,
}: Props) {
  return (
    <label className="block">
      {label && <div className="mb-xs text-sm font-medium text-text-muted">{label}</div>}
      <div className="flex items-center gap-sm rounded-control border border-border bg-bg-card px-md py-sm shadow-sm focus-within:shadow-md">
        {left && <span className="shrink-0">{left}</span>}
        <input
          className="w-full bg-transparent outline-none text-md placeholder:text-text-muted"
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={onChange}
        />
        {right && <span className="shrink-0">{right}</span>}
      </div>
      {hint && !error && <div className="mt-xs text-sm text-text-muted">{hint}</div>}
      {error && <div className="mt-xs text-sm text-[color:#D9534F]">{error}</div>}
    </label>
  );
}

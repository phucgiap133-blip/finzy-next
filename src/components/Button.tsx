// src/components/Button.js
export default function Button({
  children,
  onClick,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={
        `inline-flex items-center justify-center px-md py-sm rounded-control
         bg-brand-primary text-white text-btn shadow-sm hover:shadow-md transition ` + className
      }
    >
      {children}
    </button>
  );
}

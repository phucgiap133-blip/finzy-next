// src/components/PageContainer.jsx
export default function PageContainer({
  children,
  className = "",
  id,                // 👈 nhận id từ props
  ...rest
}) {
  return (
    <main
      id={id}        // 👈 chỉ gán khi có truyền vào
      className={[
        "mx-auto w-full px-4 md:px-6 py-6",
        "max-w-[420px] sm:max-w-screen-sm md:max-w-screen-md",
        "lg:max-w-screen-lg xl:max-w-screen-xl",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </main>
  );
}

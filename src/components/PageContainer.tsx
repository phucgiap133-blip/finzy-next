import { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  className?: string;
  id?: string;
};

export default function PageContainer({ children, className = "", id, ...rest }: Props) {
  return (
    <main
      id={id}
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

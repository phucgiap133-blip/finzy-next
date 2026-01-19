// components/GradientLayout.tsx
'use client';

export default function GradientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* FIX nền trắng iPhone – always behind everything */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(to bottom right, #FFE1F2, #F5ECFF, #D3E8FF)',
        }}
      />

      <div
        className="
          min-h-screen min-h-[100dvh]
          flex justify-center
          items-start md:items-center
          px-4 py-8 md:py-0
          overflow-y-auto finzy-scroll
          relative
        "
      >
        {children}
      </div>
    </>
  );
}

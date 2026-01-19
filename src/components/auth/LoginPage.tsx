// src/app/login/page.tsx
'use client';

import Image from 'next/image';
import React, { useMemo, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AuthSpacing } from '@/styles/authSpacing';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const emailOk = useMemo(() => !!email && /\S+@\S+\.\S+/.test(email), [email]);
  const passwordOk = useMemo(() => password.length >= 8, [password]);
  const formValid = emailOk && passwordOk;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setSubmitted(true);
    setError(null);

    if (!formValid) {
      if (!emailOk) setError('Email chưa đúng định dạng.');
      else if (!passwordOk) setError('Mật khẩu cần ít nhất 8 ký tự.');
      return;
    }

    setLoading(true);
    const result = await signIn('credentials', { redirect: false, email, password });

    if (result?.error) setError(result.error);
    else if (result?.ok) router.push('/');

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen text-[#1e293b] md:flex md:items-center md:justify-center md:px-4">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-100 via-cyan-50 to-emerald-50" />

      <div className="w-full md:max-w-6xl md:mx-auto md:bg-white/80 md:backdrop-blur-xl md:rounded-[32px] md:shadow-[0_20px_40px_rgba(0,0,0,0.08)] md:border md:border-white/50 md:grid md:grid-cols-2 md:overflow-hidden">
        {/* LEFT */}
        <div className="hidden md:flex items-center justify-center p-10 bg-gradient-to-br from-teal-50/20 to-cyan-50/10">
          <Image src="/finzy-fox.png" alt="Finzy Fox" width={420} height={420} className="drop-shadow-2xl select-none" priority />
        </div>

        {/* RIGHT */}
        <div className="w-full md:flex md:items-center md:justify-center md:bg-white/60 md:px-16 md:py-12">
          <div className="w-full max-w-[420px] px-[12px] pt-8 pb-12 md:px-0 md:pt-0 md:pb-0">
            <h1 className="text-[18px] font-semibold text-[#111827]">Đăng nhập</h1>

            {/* title → sub : 8px */}
            <p className={`${AuthSpacing.titleToSub} text-[14px] text-[#6B7280]`}>
              Đăng nhập để tiếp tục sử dụng Finzy
            </p>

            {/* sub → form : 24px */}
            <div className={AuthSpacing.subToForm}>
              <form onSubmit={handleLogin} noValidate>
                {/* EMAIL */}
                <div>
                  <label className="text-[13px] font-medium text-[#6B7280]">Email</label>
                  <div className={AuthSpacing.labelToInput}>
                    <input
                      ref={emailRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="Nhập email"
                      className="w-full h-12 rounded-[16px] bg-white px-4 text-[15px] border border-[#E5E7EB] focus:outline-none focus:border-[#F2994A] focus:ring-2 focus:ring-[#F2994A]/15 transition"
                    />
                  </div>
                </div>

                {/* Email → Password : 16px */}
                <div className={AuthSpacing.inputGap}>
                  <label className="text-[13px] font-medium text-[#6B7280]">Mật khẩu</label>
                  <div className={AuthSpacing.labelToInput}>
                    <div className="flex items-center w-full h-12 rounded-[16px] bg-white px-4 border border-[#E5E7EB] focus-within:border-[#F2994A] focus-within:ring-2 focus-within:ring-[#F2994A]/15 transition">
                      <input
                        ref={passwordRef}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setPasswordTouched(true)}
                        placeholder="Nhập mật khẩu"
                        className="flex-1 bg-transparent outline-none text-[15px]"
                      />
                      <button type="button" onClick={() => setShowPassword(v => !v)} className="ml-2 text-[#9CA3AF] text-[14px]">
                        {showPassword ? 'Ẩn' : 'Hiện'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* option gap : 12px */}
                <div className={`${AuthSpacing.optionGap} flex items-center justify-between text-[13px] text-[#6B7280]`}>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded border-[#D1D5DB] accent-[#F2994A]" />
                    Ghi nhớ đăng nhập
                  </label>
                  <button type="button" onClick={() => router.push('/reset')} className="text-[#F2994A] hover:underline">
                    Quên mật khẩu?
                  </button>
                </div>

                {/* CTA : 24px */}
                <button
                  type="submit"
                  disabled={loading || !formValid}
                  className={`${AuthSpacing.beforeCTA} w-full h-12 rounded-[16px] bg-[#F2994A] text-white font-semibold text-[15px] hover:bg-[#E88F3F] active:scale-[0.98] transition`}
                >
                  {loading ? 'Đang xử lý…' : 'Đăng nhập'}
                </button>
              </form>
            </div>

            {/* after CTA : 24px */}
            <p className={`${AuthSpacing.afterCTA} text-center text-[13px] text-slate-500`}>
              Chưa có tài khoản?{' '}
              <button onClick={() => router.push('/signup')} className="text-orange-500 hover:text-orange-600 font-bold">
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AuthSpacing } from '@/styles/authSpacing';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState(false);

  const router = useRouter();
  const emailRef = useRef<HTMLInputElement | null>(null);

  const emailOk = useMemo(() => !!email && /\S+@\S+\.\S+/.test(email), [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'loading') return;

    setSubmitted(true);
    if (!emailOk) {
      emailRef.current?.focus();
      return;
    }

    setState('loading');
    await new Promise((r) => setTimeout(r, 1500));
    setState('done');
  };

  return (
    <div className="relative min-h-screen text-[#1e293b] md:flex md:items-center md:justify-center md:px-4">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-100 via-cyan-50 to-emerald-50" />

      <div className="w-full md:max-w-6xl md:mx-auto md:bg-white/80 md:backdrop-blur-xl md:rounded-[32px] md:shadow-[0_20px_40px_rgba(0,0,0,0.08)] md:border md:border-white/50 md:grid md:grid-cols-2 md:overflow-hidden">
        {/* LEFT – PC */}
        <div className="hidden md:flex items-center justify-center p-10 bg-gradient-to-br from-teal-50/20 to-cyan-50/10">
          <Image
            src="/finzy-fox.png"
            alt="Finzy Fox"
            width={380}
            height={380}
            className="drop-shadow-2xl select-none"
            priority
          />
        </div>

        {/* RIGHT */}
        <div className="w-full md:flex md:items-center md:justify-center md:bg-white/60 md:px-16 md:py-12">
          <div className="w-full max-w-[420px] px-3 pt-8 pb-12 md:px-0 md:pt-0 md:pb-0">
            <h1 className="text-[18px] font-semibold text-[#111827]">
              Quên mật khẩu
            </h1>

            <p className={`${AuthSpacing.titleToSub} text-[14px] text-[#6B7280]`}>
              Nhập email bạn đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu.
            </p>

            {state === 'done' && (
              <div className={`${AuthSpacing.subToForm} rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-xs text-emerald-700`}>
                Đã gửi liên kết đặt lại mật khẩu tới <b>{email}</b>. Vui lòng kiểm tra hộp thư.
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className={`flex flex-col ${AuthSpacing.subToForm}`}
            >
              {/* Email */}
              <div>
                <label className="text-[13px] font-medium text-[#6B7280]">
                  Email
                </label>

                <div className={AuthSpacing.labelToInput}>
                  <input
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    placeholder="Nhập email"
                    className="
                      w-full h-12
                      rounded-[16px]
                      bg-white
                      px-4
                      text-[15px]
                      border border-[#E5E7EB]
                      focus:outline-none
                      focus:border-[#F2994A]
                      focus:ring-2 focus:ring-[#F2994A]/15
                      transition
                    "
                  />
                </div>

                {(touched || submitted) && !emailOk && email.length > 0 && (
                  <p className="text-[11px] text-red-500 mt-1">
                    Email chưa đúng định dạng.
                  </p>
                )}
              </div>

              {/* CTA */}
              <button
                type="submit"
                disabled={state === 'loading' || !emailOk}
                className={`${AuthSpacing.beforeCTA} w-full h-12 rounded-[16px] bg-[#F2994A] text-white font-semibold text-[15px] hover:bg-[#E88F3F] active:scale-[0.98] transition disabled:opacity-60`}
              >
                {state === 'loading'
                  ? 'Đang gửi…'
                  : state === 'done'
                  ? 'Gửi lại liên kết'
                  : 'Gửi liên kết đặt lại'}
              </button>
            </form>

            <p className={`${AuthSpacing.afterCTA} text-center text-[13px] text-slate-500`}>
              Nhớ mật khẩu rồi?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-[#F2994A] font-bold hover:underline"
              >
                Đăng nhập
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

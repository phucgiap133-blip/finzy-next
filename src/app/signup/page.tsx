'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AuthSpacing } from '@/styles/authSpacing';

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailRef = useRef<HTMLInputElement | null>(null);
  const pwdRef = useRef<HTMLInputElement | null>(null);
  const confirmRef = useRef<HTMLInputElement | null>(null);

  const emailOk = useMemo(() => !!email && /\S+@\S+\.\S+/.test(email), [email]);
  const passwordOk = useMemo(() => password.length >= 8, [password]);
  const matchOk = useMemo(() => password === confirm && confirm.length > 0, [password, confirm]);
  const formValid = emailOk && passwordOk && matchOk;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setSubmitted(true);

    if (!formValid) {
      if (!emailOk) setError('Email chưa đúng định dạng.');
      else if (!passwordOk) setError('Mật khẩu cần ít nhất 8 ký tự.');
      else if (!matchOk) setError('Mật khẩu xác nhận không trùng.');
      return;
    }

    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setDone(true);
    setTimeout(() => router.push('/login'), 800);
  };

  return (
    <div className="relative min-h-screen text-[#1e293b] md:flex md:items-center md:justify-center md:px-4">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-100 via-cyan-50 to-emerald-50" />

      <div className="w-full md:max-w-6xl md:mx-auto md:bg-white/80 md:backdrop-blur-xl md:rounded-[32px] md:shadow-[0_20px_40px_rgba(0,0,0,0.08)] md:border md:border-white/50 md:grid md:grid-cols-2 md:overflow-hidden">
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

        <div className="w-full md:flex md:items-center md:justify-center md:bg-white/60 md:px-16 md:py-12">
          <div className="w-full max-w-[420px] px-3 pt-8 pb-12 md:px-0 md:pt-0 md:pb-0">
            <h1 className="text-[18px] font-semibold text-[#111827]">
              Tạo tài khoản
            </h1>

            <p className={`${AuthSpacing.titleToSub} text-[14px] text-[#6B7280]`}>
              Đăng ký miễn phí và bắt đầu kiếm tiền.
            </p>

            {error && (
              <div
                className={`${AuthSpacing.subToForm} rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-700`}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className={`flex flex-col ${AuthSpacing.subToForm}`}
            >
              {/* Email */}
              <div className={`space-y-2 ${AuthSpacing.inputGap}`}>
                <label className="text-[13px] font-medium text-[#6B7280]">
                  Email
                </label>
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

              {/* Password */}
              <div className={`space-y-2 ${AuthSpacing.inputGap}`}>
                <label className="text-[13px] font-medium text-[#6B7280]">
                  Mật khẩu
                </label>
                <div className="flex items-center w-full h-12 rounded-[16px] bg-white px-4 border border-[#E5E7EB] focus-within:border-[#F2994A] focus-within:ring-2 focus-within:ring-[#F2994A]/15 transition">
                  <input
                    ref={pwdRef}
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    placeholder="Tạo mật khẩu"
                    className="flex-1 bg-transparent outline-none text-[15px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="ml-2 text-[#9CA3AF] text-[14px]"
                  >
                    {showPwd ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              {/* Confirm – FIX: thêm inputGap để đủ 16px */}
              <div className={`space-y-2 ${AuthSpacing.inputGap}`}>
                <label className="text-[13px] font-medium text-[#6B7280]">
                  Nhập lại mật khẩu
                </label>
                <div className="flex items-center w-full h-12 rounded-[16px] bg-white px-4 border border-[#E5E7EB] focus-within:border-[#F2994A] focus-within:ring-2 focus-within:ring-[#F2994A]/15 transition">
                  <input
                    ref={confirmRef}
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onBlur={() => setConfirmTouched(true)}
                    placeholder="Xác nhận mật khẩu"
                    className="flex-1 bg-transparent outline-none text-[15px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="ml-2 text-[#9CA3AF] text-[14px]"
                  >
                    {showConfirm ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !formValid || done}
                className={`${AuthSpacing.beforeCTA} w-full h-12 rounded-[16px] bg-[#F2994A] text-white font-semibold text-[15px] hover:bg-[#E88F3F] active:scale-[0.98] transition disabled:opacity-60`}
              >
                {loading ? 'Đang tạo…' : done ? 'Đã tạo thành công' : 'Tạo tài khoản'}
              </button>
            </form>

            <p className={`${AuthSpacing.afterCTA} text-center text-[13px] text-slate-500`}>
              Đã có tài khoản?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-[#F2994A] font-bold hover:underline"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

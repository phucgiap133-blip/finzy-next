'use client'; 
// Dùng 'use client' vì đây là trang có tương tác (form, next-auth hook)

import React, { useState } from 'react';
import { signIn } from 'next-auth/react'; 
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const result = await signIn('credentials', { 
            redirect: false, // Ngăn NextAuth tự chuyển hướng
            email, 
            password,
        });

        if (result?.error) {
            setError(result.error); // Lấy lỗi từ API (ví dụ: 'Email hoặc mật khẩu không đúng')
        } else if (result?.ok) {
            // Đăng nhập thành công, chuyển hướng về trang chủ
            router.push('/');
        }
        
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h1 className="text-3xl font-bold mb-6 text-indigo-700">Đăng nhập</h1>
            <div className="text-sm text-gray-500 mb-4">
                Dùng tài khoản Admin: privacy@gmail.com (hoặc pgiap316@gmail.com nếu đã đổi role)
            </div>
            
            <form onSubmit={handleLogin} className="p-8 bg-white shadow-md rounded-lg w-full max-w-sm">
                
                {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}
                
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="w-full p-2 mb-4 border rounded focus:ring-indigo-500 focus:border-indigo-500" 
                />
                <input 
                    type="password" 
                    placeholder="Mật khẩu" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="w-full p-2 mb-6 border rounded focus:ring-indigo-500 focus:border-indigo-500" 
                />
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition disabled:bg-gray-400 flex justify-center items-center"
                >
                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
            </form>
        </div>
    );
}
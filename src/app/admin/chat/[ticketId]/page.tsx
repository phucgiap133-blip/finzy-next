'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Message {
    id: number;
    role: 'USER' | 'ADMIN';
    content: string;
    createdAt: string;
}

interface TicketDetail {
    id: number;
    topic: string;
    status: 'OPEN' | 'PENDING' | 'CLOSED';
    createdAt: string;
    userEmail: string;
    userId: number;
}

interface ChatState {
    ticket: TicketDetail | null;
    messages: Message[];
    loading: boolean;
    error: string | null;
}

const statusClasses = {
    OPEN: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    CLOSED: 'bg-gray-100 text-gray-800',
};

/**
 * Trang chi tiết chat cho Admin.
 */
export default function AdminChatDetailPage({ params }: { params: { ticketId: string } }) {
    const ticketId = parseInt(params.ticketId);
    const router = useRouter();
    const [chatState, setChatState] = useState<ChatState>({
        ticket: null,
        messages: [],
        loading: true,
        error: null,
    });
    const [replyContent, setReplyContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Cuộn xuống cuối tin nhắn
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Hàm fetch dữ liệu chat
    const fetchChatDetails = useCallback(async () => {
        setChatState(prev => ({ ...prev, loading: true, error: null }));
        try {
            // Gọi API Admin GET /api/admin/support/chat?ticketId=...
            const res = await fetch(`/api/admin/support/chat?ticketId=${ticketId}`);
            const data = await res.json();

            if (!res.ok) {
                // Xử lý chuyển hướng nếu ticket không tồn tại (404)
                if (res.status === 404) {
                    throw new Error(`Ticket #${ticketId} không tồn tại.`);
                }
                throw new Error(data.error || 'Không thể tải chi tiết chat.');
            }

            setChatState({
                ticket: data.ticket,
                messages: data.messages,
                loading: false,
                error: null,
            });
            // Cuộn xuống sau khi tải xong tin nhắn
            setTimeout(scrollToBottom, 100); 

        } catch (err) {
            setChatState(prev => ({
                ...prev,
                loading: false,
                error: err instanceof Error ? err.message : 'Lỗi không xác định.',
            }));
        }
    }, [ticketId]);

    useEffect(() => {
        fetchChatDetails();
    }, [fetchChatDetails]);

    // Xử lý gửi tin nhắn
    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !chatState.ticket) return;
        if (chatState.ticket.status === 'CLOSED') return; // Không cho gửi khi đã đóng

        setIsSending(true);
        try {
            // Gọi API Admin POST /api/admin/support/send
            const res = await fetch('/api/admin/support/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketId, content: replyContent }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Gửi tin nhắn thất bại.');
            }
            
            // Cập nhật UI ngay lập tức
            const newMsgContent = replyContent.trim();
            setReplyContent(''); 
            
            setChatState(prev => ({
                ...prev,
                messages: [...prev.messages, {
                    id: data.newMessageId,
                    role: 'ADMIN', // Tin nhắn Admin
                    content: newMsgContent,
                    createdAt: new Date().toISOString(),
                }],
                // Cập nhật trạng thái thành PENDING
                ticket: prev.ticket ? { ...prev.ticket, status: data.newStatus } : prev.ticket,
            }));
            setTimeout(scrollToBottom, 50);

        } catch (err) {
            alert(`Lỗi: ${err instanceof Error ? err.message : 'Lỗi gửi tin nhắn.'}`);
        } finally {
            setIsSending(false);
        }
    };
    
    // Xử lý đóng ticket
    const handleCloseTicket = async () => {
        if (!chatState.ticket || chatState.ticket.status === 'CLOSED') return;

        if (!confirm(`Bạn có chắc chắn muốn đóng Ticket #${ticketId} không?`)) return;

        setIsClosing(true);
        try {
            // Gọi API Admin POST /api/admin/support/close
            const res = await fetch('/api/admin/support/close', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Đóng ticket thất bại.');
            }

            // Cập nhật trạng thái thành CLOSED
            setChatState(prev => ({
                ...prev,
                ticket: prev.ticket ? { ...prev.ticket, status: data.newStatus } : prev.ticket,
            }));
            alert(data.message);

        } catch (err) {
            alert(`Lỗi: ${err instanceof Error ? err.message : 'Lỗi đóng ticket.'}`);
        } finally {
            setIsClosing(false);
        }
    };


    if (chatState.loading) {
        return <div className="text-center p-8"><Loader2 className="animate-spin inline mr-2"/> Đang tải chi tiết ticket...</div>;
    }

    if (chatState.error) {
        return <div className="text-red-600 bg-red-100 p-4 rounded-lg">Lỗi: {chatState.error}</div>;
    }

    const { ticket, messages } = chatState;
    // Dù đã kiểm tra ở trên, vẫn check lại cho Type safety
    if (!ticket) { 
         return <div className="text-red-600 bg-red-100 p-4 rounded-lg">Lỗi: Không tìm thấy thông tin ticket.</div>;
    }
    
    const isClosed = ticket.status === 'CLOSED';

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
            
            {/* Header Ticket */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 flex items-center">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Quay lại danh sách
                </Link>
                <div className="text-center">
                    <h2 className="text-xl font-bold">Ticket #{ticket.id}: {ticket.topic}</h2>
                    <p className="text-sm text-gray-500">Người dùng: {ticket.userEmail}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClasses[ticket.status]}`}>
                        {ticket.status}
                    </span>
                    {!isClosed && (
                        <button
                            onClick={handleCloseTicket}
                            disabled={isClosing}
                            className={`p-2 rounded-full text-white transition duration-150 flex items-center justify-center ${
                                isClosing ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                            {isClosing ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Khung Chat */}
            <div className="h-[60vh] p-4 overflow-y-auto space-y-4 bg-gray-50">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-md p-3 rounded-lg shadow-md ${
                                msg.role === 'ADMIN'
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-white text-gray-800 border'
                            }`}
                        >
                            <p className="text-xs font-semibold mb-1">
                                {msg.role === 'ADMIN' ? 'Admin' : 'Khách hàng'}
                            </p>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <p className="text-right text-xs mt-1 opacity-70">
                                {new Date(msg.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Reply */}
            <form onSubmit={handleSendReply} className="p-4 border-t bg-white">
                {isClosed && (
                    <p className="text-center text-red-500 mb-2 font-medium">Ticket đã đóng. Không thể gửi tin nhắn.</p>
                )}
                <div className="flex space-x-3">
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={isClosed ? "Ticket đã đóng." : "Gõ tin nhắn trả lời Admin..."}
                        disabled={isClosed || isSending}
                        rows={3}
                        className="flex-1 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                    <button
                        type="submit"
                        disabled={isClosed || isSending || !replyContent.trim()}
                        className={`p-3 rounded-lg text-white transition duration-150 flex items-center justify-center ${
                            isClosed || isSending || !replyContent.trim()
                                ? 'bg-gray-400'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                        {isSending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                    </button>
                </div>
            </form>
        </div>
    );
}

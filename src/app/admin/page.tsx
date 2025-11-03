"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface AdminTicket {
  id: number;
  topic: string;
  status: "OPEN" | "PENDING" | "CLOSED";
  createdAt: string;
  userEmail: string;
  lastMessage: string;
  lastRole: "USER" | "ADMIN" | null;
}

const statusClasses = {
  OPEN: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    // Thử đọc token đã lưu sau khi login (tuỳ app của bạn gán khóa nào)
    const t = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
    if (t) setToken(t);
  }, []);

  const fetchTickets = async (authToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/support/tickets", {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Không thể tải danh sách tickets.");
      setTickets(data.tickets ?? []);
    } catch (e: any) {
      setError(e?.message || "Lỗi không xác định khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <input
          className="border px-2 py-1 w-[520px]"
          placeholder="(Tùy chọn) Dán token ADMIN tại đây nếu chưa lưu localStorage"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button
          onClick={() => fetchTickets(token)}
          className="border px-3 py-1 rounded"
        >
          Refresh
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Danh sách Support Tickets</h2>

      {loading ? (
        <div className="text-center p-8">
          <Loader2 className="animate-spin inline mr-2" /> Đang tải danh sách tickets...
        </div>
      ) : error ? (
        <div className="text-red-600 bg-red-100 p-4 rounded-lg">Lỗi tải dữ liệu: {error}</div>
      ) : tickets.length === 0 ? (
        <p className="text-gray-500">Hiện không có ticket nào.</p>
      ) : (
        <ul className="space-y-4">
          {tickets.map((ticket) => (
            <li
              key={ticket.id}
              className="flex justify-between items-center p-4 border rounded-lg hover:bg-indigo-50 transition duration-150"
            >
              <div className="flex-1">
                <Link
                  href={`/admin/chat/${ticket.id}`}
                  className="text-lg font-medium text-indigo-600 hover:text-indigo-800"
                >
                  #{ticket.id} - {ticket.topic}
                </Link>
                <p className="text-sm text-gray-500">Người dùng: {ticket.userEmail}</p>
                <p className="text-sm text-gray-700 mt-1">
                  Tin nhắn cuối:
                  <span
                    className={`ml-2 font-bold ${
                      ticket.lastRole === "ADMIN" ? "text-blue-500" : "text-purple-500"
                    }`}
                  >
                    ({ticket.lastRole || "N/A"}):
                  </span>{" "}
                  {ticket.lastMessage?.slice(0, 50)}
                  {ticket.lastMessage?.length > 50 ? "..." : ""}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${statusClasses[ticket.status]}`}
                >
                  {ticket.status}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  Tạo ngày: {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

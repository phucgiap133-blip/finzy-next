// src/app/api/_db.ts
export type Currency = 'VND';
export type WithdrawStatus = 'pending' | 'success' | 'failed';
export type StatusVN = 'Thành công' | 'Đang xử lý' | 'Thất bại';

export interface Wallet { balance: number; currency: Currency }
export interface WalletHistoryItem { id: string; text: string; sub?: string; createdAt: string }

export interface WithdrawResponse { id: string; amount: number; fee: number; status: WithdrawStatus; createdAt: string }
export interface WithdrawalHistoryItem { id: string; amount: number; status: StatusVN; fee: number; method: string; createdAt: string }
export interface CommissionItem { id: string; amount: number; status: StatusVN; createdAt: string }

export interface BankAccount { id: string; bankName: string; last4: string; holder: string; tag?: string }

export type ChatSender = 'agent' | 'user' | 'system';
export interface ChatMessage { id: string; from: ChatSender; text: string; createdAt: string }

export const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
export const uid = (p = '') => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

export const db = {
  wallet: { balance: 37000, currency: 'VND' as const },
  history: [
    { id: uid('h_'), text: 'Đã cộng +10.000đ', sub: 'cho bạn và người B', createdAt: new Date(Date.now()-36e5).toISOString() },
    { id: uid('h_'), text: 'Đã cộng +10.000đ', sub: 'cho bạn và người B', createdAt: new Date(Date.now()-72e5).toISOString() },
    { id: uid('h_'), text: 'Đã cộng +10.000đ', sub: 'cho bạn và người B', createdAt: new Date(Date.now()-108e5).toISOString() },
  ] as WalletHistoryItem[],
  withdrawals: [] as WithdrawResponse[],
  withdrawalItems: [
    { id: uid('wr_'), amount: -100000, status: 'Thành công' as StatusVN, fee: 0, method: 'MoMo *****5678', createdAt: '2025-08-17T10:21:00.000Z' },
    { id: uid('wr_'), amount: -100000, status: 'Thành công' as StatusVN, fee: 0, method: 'MoMo *****5678', createdAt: '2025-08-17T09:59:00.000Z' },
    { id: uid('wr_'), amount: -100000, status: 'Đang xử lý' as StatusVN, fee: 0, method: 'MB Bank *****1234', createdAt: '2025-09-12T09:02:00.000Z' },
  ] as WithdrawalHistoryItem[],
  commissionItems: [
    { id: uid('cm_'), amount: 10000, status: 'Đang xử lý' as StatusVN, createdAt: new Date(Date.now()-86400000).toISOString() },
    { id: uid('cm_'), amount: 10000, status: 'Thành công' as StatusVN, createdAt: new Date(Date.now()-2*86400000).toISOString() },
    { id: uid('cm_'), amount: 10000, status: 'Thất bại' as StatusVN, createdAt: new Date(Date.now()-3*86400000).toISOString() },
  ] as CommissionItem[],
  banks: {
    accounts: [
      { id: uid('bk_'), bankName: 'MB Bank', last4: '1234', holder: 'Nguyễn Văn A', tag: 'Mặc định' },
      { id: uid('bk_'), bankName: 'MoMo', last4: '5678', holder: 'Nguyễn Văn A', tag: 'Khuyên dùng' },
    ] as BankAccount[],
    selectedId: null as string | null,
  },
  chats: {
    default: [{ id: uid('m_'), from: 'agent' as ChatSender, text: 'Xin chào, tôi có thể giúp gì cho bạn?', createdAt: new Date().toISOString() }],
  } as Record<string, ChatMessage[]>,
  auth: {
    users: [{ email: 'user@example.com', password: '123456' }],
    otps: {} as Record<string, { code: string; expireAt: number }>,
  },
};

export function jsonErr(message: string, code = 400) {
  return Response.json({ error: message }, { status: code });
}

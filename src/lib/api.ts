/* ========================= Types ========================= */
export type Currency = "VND";
export type WithdrawStatus = "pending" | "success" | "failed";

export interface Wallet { balance: number; currency: Currency; }
export interface WalletHistoryItem { id: string; text: string; sub?: string; createdAt: string; }
export interface WalletResponse { wallet: Wallet; history: WalletHistoryItem[]; }

export interface WithdrawRequest { amount: number; methodId: string; }
export interface WithdrawResponse {
  id: string; amount: number; fee: number; status: WithdrawStatus; createdAt: string;
}

export type SupportTopic = "withdraw-slow" | "referral" | "other";
export interface SupportTicketRequest { topic: SupportTopic; message: string; meta?: Record<string, any>; }
export interface SupportTicketResponse { ticketId: string; status: "received"; createdAt: string; }

/* ===== New: history (withdrawals/commissions) & banks ===== */
export interface WithdrawalHistoryItem {
  id: string;
  amount: number;              // âm
  status: "Thành công" | "Đang xử lý" | "Thất bại";
  fee: number;
  method: string;              // "MoMo *****5678" / "MB Bank *****1234"
  createdAt: string;           // ISO
}

export interface CommissionItem {
  id: string;
  amount: number;              // dương
  status: "Thành công" | "Đang xử lý" | "Thất bại";
  createdAt: string;           // ISO
}

export interface WithdrawalsResponse { items: WithdrawalHistoryItem[]; }
export interface CommissionsResponse  { items: CommissionItem[]; }

export interface BankAccount {
  id: string;
  bankName: string;            // "MB Bank" / "MoMo" ...
  last4: string;               // "1234"
  holder: string;              // "Nguyễn Văn A"
  tag?: "Khuyên dùng" | "Mặc định" | string;
}

export interface BanksResponse {
  accounts: BankAccount[];
  selectedId: string | null;
}

export interface BankSelectRequest { id: string; }
export interface BankLinkRequest { bankName: string; number: string; holder: string; }
export interface BankLinkResponse { id: string; }

/* ===== NEW: Delete bank (theo cách bạn gọi api.banks.delete({ id })) ===== */
export interface BankDeleteRequest { id: string; }
export interface BankDeleteResponse { ok: true; }

/* ===== NEW: Chat types ===== */
export type ChatSender = "agent" | "user" | "system";
export interface ChatMessage {
  id: string;
  from: ChatSender;
  text: string;
  createdAt: string; // ISO
}
export interface ChatHistoryResponse {
  room: string;
  messages: ChatMessage[];
}
export interface ChatSendRequest {
  room: string;
  text: string;
}
export interface ChatSendResponse {
  ok: true;
  messageId: string;
}

/* ===================== Env & helpers ===================== */
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "1";
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.example.com").replace(/\/+$/, "");
const delay = (ms:number)=>new Promise(r=>setTimeout(r,ms));
const uid = (p="") => p + Math.random().toString(36).slice(2,8) + Date.now().toString(36).slice(-4);

/* =================== HTTP (typed) ==================== */
async function get<T>(path: string): Promise<T> {
  if (USE_MOCK) return (await mockGet(path)) as T;
  const res = await fetch(`${BASE_URL}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return (await res.json()) as T;
}

async function post<Req,Res>(path:string, body:Req):Promise<Res>{
  if (USE_MOCK) return (await mockPost(path, body)) as Res;
  const res = await fetch(`${BASE_URL}${path}`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    credentials:"include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} ${res.status} ${await res.text().catch(()=> "")}`);
  return (await res.json()) as Res;
}

/* ===== NEW: tiện ích gọi “tự do” nếu bạn muốn ===== */
export async function apiFetch<T=any>(
  path: string,
  init?: (RequestInit & { json?: any }) | undefined
): Promise<T> {
  if (USE_MOCK) {
    const method = (init?.method || "GET").toUpperCase();
    if (method === "GET") return (await mockGet(path)) as T;
    const body = init?.json ?? (typeof init?.body === "string" ? JSON.parse(init!.body as string) : undefined);
    return (await mockPost(path, body)) as T;
  }
  const url = `${BASE_URL}${path}`;
  const headers: Record<string,string> = { ...(init?.headers as Record<string,string>), };
  let body: BodyInit | undefined = init?.body as any;
  if (init?.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  }
  const res = await fetch(url, { ...init, headers, body, credentials:"include" });
  if (!res.ok) throw new Error(`${init?.method || "GET"} ${path} ${res.status}`);
  return (await res.json()) as T;
}

/* ===================== Public API (typed) ======================== */
async function getWallet(){ return await get<WalletResponse>("/wallet"); }              // A
async function createWithdraw(payload:WithdrawRequest){
  return await post<WithdrawRequest,WithdrawResponse>("/withdraw", payload);            // B
}
async function createSupportTicket(payload:SupportTicketRequest){
  return await post<SupportTicketRequest,SupportTicketResponse>("/support/ticket",payload); // C
}

/* NEW: history & banks */
async function getWithdrawals(){ return await get<WithdrawalsResponse>("/withdrawals"); }
async function getCommissions(){  return await get<CommissionsResponse>("/commissions"); }
async function getBanks(){        return await get<BanksResponse>("/banks"); }
async function selectBank(payload:BankSelectRequest){
  return await post<BankSelectRequest, { ok:true }>("/banks/select", payload);
}
async function linkBank(payload:BankLinkRequest){
  return await post<BankLinkRequest,BankLinkResponse>("/banks/link", payload);
}
/* NEW: delete bank (đúng với cách bạn đang dùng) */
async function deleteBank(payload:BankDeleteRequest){
  // Mock: /banks/delete ; Backend thật nếu khác (DELETE /banks/:id) thì báo mình map lại.
  return await post<BankDeleteRequest, BankDeleteResponse>("/banks/delete", payload);
}

/* ===== NEW: Chat API (typed) ===== */
async function chatHistory(room:string){
  return await get<ChatHistoryResponse>(`/support/chat/history?room=${encodeURIComponent(room)}`);
}
async function chatSend(payload:ChatSendRequest){
  return await post<ChatSendRequest,ChatSendResponse>(`/support/chat/send`, payload);
}

export const api = {
  wallet:   { get: getWallet },
  withdraw: { create: createWithdraw },
  support:  { createTicket: createSupportTicket, chat: { history: chatHistory, send: chatSend } },
  history:  {
    withdrawals: { get: getWithdrawals },
    commissions: { get: getCommissions },
  },
  banks:    { get: getBanks, select: selectBank, link: linkBank, delete: deleteBank }, // ← thêm delete
  // raw fetch nếu bạn muốn gọi tự do:
  fetch: apiFetch,
};

/* =================== MOCK (in-memory) ==================== */
type MockDB = {
  wallet: Wallet;
  history: WalletHistoryItem[];
  withdrawals: WithdrawResponse[];
  tickets: SupportTicketResponse[];
  withdrawalItems: WithdrawalHistoryItem[];
  commissionItems: CommissionItem[];
  banks: { accounts: BankAccount[]; selectedId: string | null; };
  chats: Record<string, ChatMessage[]>;
};

const mockDB: MockDB = {
  wallet: { balance: 37000, currency: "VND" },
  history: [
    { id: uid("h_"), text: "Đã cộng +10.000đ", sub: "cho bạn và người B", createdAt: new Date(Date.now()-36e5).toISOString() },
    { id: uid("h_"), text: "Đã cộng +10.000đ", sub: "cho bạn và người B", createdAt: new Date(Date.now()-72e5).toISOString() },
    { id: uid("h_"), text: "Đã cộng +10.000đ", sub: "cho bạn và người B", createdAt: new Date(Date.now()-108e5).toISOString() },
  ],
  withdrawals: [],
  tickets: [],
  withdrawalItems: [
    { id: uid("wr_"), amount: -100000, status: "Thành công",  fee: 0, method: "MoMo *****5678",    createdAt: "2025-08-17T10:21:00.000Z" },
    { id: uid("wr_"), amount: -100000, status: "Thành công",  fee: 0, method: "MoMo *****5678",    createdAt: "2025-08-17T09:59:00.000Z" },
    { id: uid("wr_"), amount: -100000, status: "Đang xử lý", fee: 0, method: "MB Bank *****1234", createdAt: "2025-09-12T09:02:00.000Z" },
  ],
  commissionItems: [
    { id: uid("cm_"), amount: 10000, status: "Đang xử lý", createdAt: new Date(Date.now()-86400000).toISOString() },
    { id: uid("cm_"), amount: 10000, status: "Thành công", createdAt: new Date(Date.now()-2*86400000).toISOString() },
    { id: uid("cm_"), amount: 10000, status: "Thất bại",   createdAt: new Date(Date.now()-3*86400000).toISOString() },
  ],
  banks: {
    accounts: [
      { id: uid("bk_"), bankName: "MB Bank", last4: "1234", holder: "Nguyễn Văn A", tag: "Mặc định" },
      { id: uid("bk_"), bankName: "MoMo",    last4: "5678", holder: "Nguyễn Văn A", tag: "Khuyên dùng" },
    ],
    selectedId: null,
  },
  chats: {
    default: [
      { id: uid("m_"), from: "agent", text: "Xin chào, tôi có thể giúp gì cho bạn?", createdAt: new Date().toISOString() },
    ],
  },
};

const tone = (status:string) =>
  status === "Thành công" ? "success" : status === "Đang xử lý" ? "warning" : "danger";

/* --------- Mock GET ---------- */
async function mockGet(path:string){
  await delay(200);

  if (path === "/wallet"){
    const res: WalletResponse = { wallet: mockDB.wallet, history: mockDB.history.slice(0,20) };
    return res;
  }

  if (path === "/withdrawals"){
    const res: WithdrawalsResponse = { items: mockDB.withdrawalItems.map(i => ({ ...i })) };
    return res;
  }

  if (path === "/commissions"){
    const res: CommissionsResponse = { items: mockDB.commissionItems.map(i => ({ ...i })) };
    return res;
  }

  if (path === "/banks"){
    const res: BanksResponse = {
      accounts: mockDB.banks.accounts.map(a => ({ ...a })),
      selectedId: mockDB.banks.selectedId ?? mockDB.banks.accounts[0]?.id ?? null,
    };
    return res;
  }

  if (path.startsWith("/support/chat/history")) {
    const url = new URL(`http://x${path}`); // trick parse query
    const room = url.searchParams.get("room") || "default";
    const messages = mockDB.chats[room] || (mockDB.chats[room] = []);
    const res: ChatHistoryResponse = { room, messages: messages.map(m => ({ ...m })) };
    return res;
  }

  throw new Error(`Mock GET: unknown path ${path}`);
}

/* --------- Mock POST --------- */
async function mockPost(path:string, body:any){
  await delay(350);

  if (path === "/withdraw"){
    const req = body as WithdrawRequest;
    const MIN = 20000, FEE = 0;

    if (!Number.isFinite(req.amount) || req.amount <= 0) throw new Error("Số tiền rút không hợp lệ");
    if (req.amount < MIN) throw new Error(`Tối thiểu ${MIN.toLocaleString()}đ`);
    if (req.amount > mockDB.wallet.balance) throw new Error("Số dư không đủ");

    mockDB.wallet.balance -= req.amount + FEE;

    const withd: WithdrawResponse = {
      id: uid("w_"), amount: req.amount, fee: FEE, status: "success", createdAt: new Date().toISOString(),
    };
    mockDB.withdrawals.unshift(withd);
    mockDB.history.unshift({
      id: uid("h_"), text: `Đã rút -${req.amount.toLocaleString()}đ`, createdAt: new Date().toISOString(),
    });

    mockDB.withdrawalItems.unshift({
      id: withd.id,
      amount: -req.amount,
      status: "Thành công",
      fee: FEE,
      method: "MB Bank *****1234",
      createdAt: withd.createdAt,
    });

    return withd;
  }

  if (path === "/support/ticket"){
    const ticket: SupportTicketResponse = { ticketId: uid("t_"), status: "received", createdAt: new Date().toISOString() };
    mockDB.tickets.unshift(ticket);
    return ticket;
  }

  if (path === "/banks/select"){
    const { id } = body as BankSelectRequest;
    const exists = mockDB.banks.accounts.some(a => a.id === id);
    if (!exists) throw new Error("Tài khoản không tồn tại");
    mockDB.banks.selectedId = id;
    return { ok: true };
  }

  if (path === "/banks/link"){
    const req = body as BankLinkRequest;
    if (!req.bankName || !req.number || !req.holder) throw new Error("Thiếu thông tin");
    const id = uid("bk_");
    mockDB.banks.accounts.unshift({
      id,
      bankName: req.bankName,
      last4: req.number.slice(-4),
      holder: req.holder,
      tag: "Mới liên kết",
    });
    mockDB.banks.selectedId = id;
    return { id };
  }

  /* ===== NEW: /banks/delete ===== */
  if (path === "/banks/delete"){
    const { id } = body as BankDeleteRequest;
    const idx = mockDB.banks.accounts.findIndex(a => a.id === id);
    if (idx === -1) throw new Error("Tài khoản không tồn tại");

    const deletingSelected = mockDB.banks.selectedId === id;
    mockDB.banks.accounts.splice(idx, 1);

    if (deletingSelected) {
      mockDB.banks.selectedId = mockDB.banks.accounts[0]?.id ?? null;
    }

    return { ok: true } as BankDeleteResponse;
  }

  if (path === "/support/chat/send") {
    const req = body as ChatSendRequest;
    const room = req.room || "default";
    const list = mockDB.chats[room] || (mockDB.chats[room] = []);

    const userMsg: ChatMessage = {
      id: uid("u_"),
      from: "user",
      text: req.text,
      createdAt: new Date().toISOString(),
    };
    list.push(userMsg);

    // Bot auto-reply đơn giản
    let reply = "Cám ơn bạn! Yêu cầu đã được ghi nhận.";
    if (/rút|chậm/i.test(req.text)) reply = "Bạn đang gặp vấn đề rút tiền chậm? Mình đã tạo ticket cho bạn.";
    if (/giới thiệu|referral/i.test(req.text)) reply = "Về thưởng giới thiệu: mình sẽ kiểm tra giúp bạn.";

    const agentMsg: ChatMessage = {
      id: uid("a_"),
      from: "agent",
      text: reply,
      createdAt: new Date().toISOString(),
    };
    list.push(agentMsg);

    const res: ChatSendResponse = { ok: true, messageId: userMsg.id };
    return res;
  }

  throw new Error(`Mock POST: unknown path ${path}`);
}

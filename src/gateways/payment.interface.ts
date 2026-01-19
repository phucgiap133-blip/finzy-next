// src/gateways/payment.interface.ts

/** Trạng thái chuẩn của hệ thống (khớp DB) */
export type StdWithdrawStatus = "QUEUED" | "PROCESSING" | "SUCCESS" | "FAILED";

/** Yêu cầu rút gửi sang cổng thanh toán */
export interface WithdrawRequest {
  userId: number | string;
  amount: number;
  bankName: string;
  bankAccountMasked?: string; // ví dụ *****1234
  internalWithdrawalId?: number;
  idempotencyKey?: string;
}

/** Kết quả sau khi submit lệnh rút */
export interface WithdrawSubmitResult {
  ok: true;
  gatewayRef: string; // mã tham chiếu phía cổng
}

/** Giao diện chuẩn gateway */
export interface PaymentGateway {
  /** Gửi yêu cầu rút lần đầu */
  process(req: WithdrawRequest): Promise<WithdrawSubmitResult>;

  /** Kiểm tra trạng thái theo tham chiếu cổng (nếu cần polling) */
  checkStatus(ref: string): Promise<StdWithdrawStatus>;
}

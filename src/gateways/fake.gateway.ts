// src/gateways/fake.gateway.ts
import type {
  PaymentGateway,
  WithdrawRequest,
  WithdrawSubmitResult,
  StdWithdrawStatus,
} from "./payment.interface";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Gateway fake để dev/test.
 * - process(): giả lập tạo giao dịch và trả về gatewayRef
 * - checkStatus(): giả lập tiến trình PROCESSING → SUCCESS/FAILED
 */
export class FakeGateway implements PaymentGateway {
  async process(req: WithdrawRequest): Promise<WithdrawSubmitResult> {
    // giả lập mạng/chờ đối tác
    await delay(Math.floor(Math.random() * 800) + 300);
    const ref = `FAKE-${Date.now()}-${req.userId}`;
    return { ok: true, gatewayRef: ref };
  }

  async checkStatus(ref: string): Promise<StdWithdrawStatus> {
    await delay(Math.floor(Math.random() * 600) + 200);

    // Xác suất: 10% FAILED, 40% PROCESSING, 50% SUCCESS
    const r = Math.random();
    if (r < 0.1) return "FAILED";
    if (r < 0.5) return "PROCESSING";
    return "SUCCESS";
  }
}

// tiện export 1 instance xài nhanh
export const fakeGateway = new FakeGateway();

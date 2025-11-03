// src/gateways/fake.gateway.ts
import { PaymentGateway, PaymentDetails } from './payment.interface';

class FakePaymentGateway implements PaymentGateway {
    
    async processWithdrawal(details: PaymentDetails): Promise<string> {
        console.log(`[Fake Gateway] Nhận yêu cầu rút: ${details.amount} VND`);

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const isSuccess = Math.random() > 0.1; // 90% thành công, 10% thất bại mô phỏng

                if (isSuccess) {
                    const refId = `FAKE-${Date.now()}-${details.bankAccount.slice(-4)}`;
                    resolve(refId); 
                } else {
                    reject(new Error('FGW-001: Lỗi kết nối mô phỏng.'));
                }
            }, 500 + Math.random() * 1500); // Độ trễ ngẫu nhiên
        });
    }

    async checkStatus(refId: string): Promise<'success' | 'failed' | 'pending'> {
        return Promise.resolve('pending'); 
    }
}

export const paymentGateway: PaymentGateway = new FakePaymentGateway();
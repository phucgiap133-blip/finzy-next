// src/gateways/payment.interface.ts
export interface PaymentDetails {
    amount: number;
    bankAccount: string;
    bankName: string;
}

export interface PaymentGateway {
    processWithdrawal(details: PaymentDetails): Promise<string>; 
    checkStatus(refId: string): Promise<'success' | 'failed' | 'pending'>;
}
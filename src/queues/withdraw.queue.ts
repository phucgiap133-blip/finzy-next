// src/queues/withdraw.queue.ts
import { Queue } from 'bullmq'; 
import { Redis } from 'ioredis'; 

// 1. Cấu hình kết nối Redis
const connection = new Redis({ 
    host: 'localhost', 
    port: 6379 
}); 

// 2. Định nghĩa Interface cho dữ liệu của Job
export interface WithdrawJobData {
    userId: string;
    amount: number;
    bankAccount: string;
    bankName: string;
    idempotencyKey: string;
}

// 3. Khởi tạo Queue rút tiền
export const WITHDRAW_QUEUE_NAME = 'withdrawals';
export const withdrawQueue = new Queue<WithdrawJobData>(WITHDRAW_QUEUE_NAME, { 
    connection,
    defaultJobOptions: {
        attempts: 3, 
        backoff: { type: 'exponential', delay: 5000 }, 
        removeOnComplete: true, 
        removeOnFail: 500
    }
});
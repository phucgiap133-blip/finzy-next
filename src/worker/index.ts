// src/worker/index.ts


const SKIP_REDIS = process.env.SKIP_REDIS === '1' || process.env.SKIP_REDIS === 'true';
const REDIS_URL = process.env.REDIS_URL || '';

async function main() {
  console.log('[worker] start…');
  if (SKIP_REDIS) {
    console.log('[worker] SKIP_REDIS=1 → không khởi tạo queue, chạy chế độ giả lập.');
    // Có thể đặt poll DB/console log ở đây nếu muốn.
    return;
  }
  if (!REDIS_URL) {
    console.error('[worker] Thiếu REDIS_URL. Thoát.');
    process.exit(1);
  }

  // Ví dụ BullMQ (nếu bạn có cài bullmq)
  // const { Queue, Worker, QueueEvents } = await import('bullmq');
  // const connection = { url: REDIS_URL };

  // const withdrawals = new Queue('withdrawals', { connection });
  // const worker = new Worker('withdrawals', async (job) => {
  //   console.log('[worker] xử lý job:', job.id, job.name, job.data);
  //   // … xử lý rút tiền …
  // }, { connection });

  // const events = new QueueEvents('withdrawals', { connection });
  // events.on('completed', ({ jobId }) => console.log('[worker] done job', jobId));
  // events.on('failed', ({ jobId, failedReason }) => console.error('[worker] fail job', jobId, failedReason));

  console.log('[worker] Đã khởi tạo (demo).'); // Bỏ comment các dòng trên nếu dùng BullMQ thật
}

main().catch((e) => {
  console.error('[worker] Lỗi:', e);
  process.exit(1);
});

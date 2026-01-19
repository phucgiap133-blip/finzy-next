## Final Setup Notes

- Prisma enums đã bỏ để tương thích SQLite. Dùng string:
  - `User.role`: "USER" | "ADMIN"
  - `Withdrawal.status`: "QUEUED" | "PROCESSING" | "SUCCESS" | "FAILED"
  - `SupportTicket.status`: "OPEN" | "PENDING" | "CLOSED"

- Admin endpoints:
  - `GET /api/admin/support/tickets`
  - `GET /api/admin/support/chat/history?ticketId=...`
  - `POST /api/admin/support/chat/send` (body: `{ ticketId, content }`)
  - `POST /api/admin/support/close` (body: `{ ticketId }`)

### Run
```bash
# .env
# DATABASE_URL="file:./prisma/dev.db"

npm i
npx prisma generate
npx prisma migrate dev -n "final-sync"
npm run dev

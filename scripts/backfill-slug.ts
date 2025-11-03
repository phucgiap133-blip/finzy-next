// scripts/backfill-slug.ts
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    where: { slug: null },
    select: { id: true, title: true },
  });

  console.log(`Found ${posts.length} posts to backfill...`);

  // để tránh trùng slug trong 1 lần chạy
  const used = new Set<string>();

  for (const p of posts) {
    const base = slugify(p.title, { lower: true, strict: true }) || `post-${p.id}`;
    let candidate = base;
    let i = 1;

    // kiểm tra trùng trong DB và trong bộ nhớ
    // (khi chưa có unique index thì dùng findFirst)
    // khi đã có unique index thì có thể dùng findUnique
    // nhưng ở bước này chưa unique nên dùng findFirst
    // NOTE: SQLite không phân biệt hoa/thường như nhau cho unique index,
    // nhưng slugify đã lower-case nên ổn.
    while (used.has(candidate) || await prisma.post.findFirst({ where: { slug: candidate } })) {
      candidate = `${base}-${i++}`;
    }

    await prisma.post.update({
      where: { id: p.id },
      data: { slug: candidate },
    });

    used.add(candidate);
    console.log(`Backfilled post ${p.id} -> ${candidate}`);
  }

  console.log('Backfill done.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

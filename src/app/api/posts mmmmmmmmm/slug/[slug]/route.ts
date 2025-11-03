// src/app/api/posts/slug/[slug]/route.ts
import { NextResponse } from "next/server";
import { assertAuth } from "@/lib/auth-middleware";
import { handleApiError, ApiError } from "@/lib/utils";
import { prisma } from "@/server/prisma";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = decodeURIComponent(params.slug || "").trim();
    if (!slug) throw new ApiError("Slug không hợp lệ", 400);

    const post = await prisma.post.findUnique({
      where: { slug },                 // cần @unique trên Post.slug
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        published: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, email: true, role: true } },
      },
    });

    if (!post) throw new ApiError("Bài viết không tồn tại", 404);

    // Nếu chưa publish → chỉ tác giả hoặc ADMIN mới xem
    if (!post.published) {
      let auth: { userId: string; role?: string } | null = null;
      try { auth = assertAuth(req); } catch { auth = null; }
      const uid = auth ? Number(auth.userId) : NaN;
      if (!auth || (uid !== post.author.id && auth.role !== "ADMIN")) {
        throw new ApiError("Bạn không có quyền xem bài viết riêng tư này", 403);
      }
    }

    const { role: _role, ...author } = post.author;
    return NextResponse.json({ ok: true, post: { ...post, author } });
  } catch (err) {
    return handleApiError(err);
  }
}

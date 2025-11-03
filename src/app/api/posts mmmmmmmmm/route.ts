import { NextResponse } from "next/server";
import { assertAuth } from "@/lib/auth-middleware";
import { PostCreateSchema, PostCreatePayload } from "@/lib/validations/post";
import { handleApiError, ApiError } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import slugify from 'slugify'; // ✅ Cần import slugify

/** POST /api/posts – tạo bài viết (yêu cầu đăng nhập) */
export async function POST(req: Request) {
    try {
        const auth = assertAuth(req);
        const authorIdStr = auth.userId;
        const authorId = Number(authorIdStr);
        // ... (check authorId)

        const json = await req.json();
        const parsed = PostCreateSchema.safeParse(json);
        // ... (handle Zod errors)

        const { title, content, published } = parsed.data as PostCreatePayload;

        // --- LOGIC TẠO SLUG ---
        const generatedSlug = slugify(title, { lower: true, strict: true });
        const existingPost = await prisma.post.findUnique({
            where: { slug: generatedSlug },
        });

        const finalSlug = existingPost
            ? `${generatedSlug}-${Date.now()}`
            : generatedSlug;

        // --- LOGIC BẢO VỆ XUẤT BẢN ---
        // Chỉ Admin mới có thể đặt published: true
        const isPublished = (published === true && auth.role === 'ADMIN') ? true : false;

        const newPost = await prisma.post.create({
            data: {
                title,
                content: content ?? '',
                slug: finalSlug, // ✅ Slug đã được thêm
                published: isPublished, // ✅ Logic bảo vệ đã được thêm
                author: { connect: { id: authorId } },
            },
            select: { 
                // ... (các trường select)
                slug: true, // ✅ Đã có slug trong select
            },
        });

        return NextResponse.json(
            { ok: true, message: "Bài viết đã được tạo thành công.", post: newPost },
            { status: 201 }
        );
    } catch (err) {
        return handleApiError(err);
    }
}

// ...
/** GET /api/posts – danh sách bài viết public */
export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            where: { published: true },
            select: {
                id: true,
                title: true,
                slug: true, // ✅ Bổ sung dòng này
                content: true,
                createdAt: true,
                author: { select: { id: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        return NextResponse.json({ ok: true, posts });
    } catch (err) {
        return handleApiError(err);
    }
}
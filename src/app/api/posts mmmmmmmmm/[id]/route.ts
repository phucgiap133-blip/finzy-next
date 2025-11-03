import { NextResponse } from "next/server";
import { assertAuth } from "@/lib/auth-middleware";
import { handleApiError, ApiError, assertPostOwnership, readJsonAndValidate } from "@/lib/utils";
import { PostCreateSchema } from "@/lib/validations/post";
import { prisma } from "@/server/prisma";
import slugify from "slugify";
import type { Prisma } from "@prisma/client";

// Type cho update payload
type PostUpdatePayload = {
  title?: string;
  content?: string;
  published?: boolean;
};

/**
 * LƯU Ý: Hàm GET đã được chuyển sang route /api/posts/slug/[slug] để sử dụng URL thân thiện (SEO).
 * Route này (posts/[id]) chỉ còn xử lý PUT và DELETE.
 */

/**
 * @method PUT /api/posts/[id]
 * @description Cập nhật bài viết (Yêu cầu Token và Quyền Sở hữu)
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Xác thực Token & Lấy User Info
    const auth = assertAuth(req);
    const authUserId = Number(auth.userId);
    const userRole = auth.role;

    // 2. Validation ID & Payload
    const postId = parseInt(params.id);
    if (isNaN(postId)) {
      throw new ApiError("ID bài viết không hợp lệ", 400);
    }

    const updateSchema = PostCreateSchema.partial();
    const validatedData = (await readJsonAndValidate(
      req,
      updateSchema
    )) as PostUpdatePayload;

    // 3. Kiểm tra Bài viết tồn tại và Quyền sở hữu
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      throw new ApiError("Bài viết không tồn tại", 404);
    }

    await assertPostOwnership(post.authorId, authUserId, userRole);

    // 4. Chuẩn bị data cập nhật
    const updateData: Prisma.PostUpdateInput = { ...validatedData };

    // Nếu có đổi title -> cập nhật slug
    if (validatedData.title) {
      const generatedSlug = slugify(validatedData.title, {
        lower: true,
        strict: true,
      });

      // tìm bài có slug trùng (nhưng khác ID hiện tại)
      const existingPost = await prisma.post.findFirst({
        where: { slug: generatedSlug, NOT: { id: postId } },
      });

      updateData.slug = existingPost
        ? `${generatedSlug}-${Date.now()}`
        : generatedSlug;
    }

    // 5. Thực hiện Cập nhật
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        updatedAt: true,
        author: { select: { id: true, email: true } },
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Bài viết đã được cập nhật thành công.",
      post: updatedPost,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * @method DELETE /api/posts/[id]
 * @description Xóa bài viết (Yêu cầu Token và Quyền Sở hữu)
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Xác thực
    const auth = assertAuth(req);
    const authUserId = Number(auth.userId);
    const userRole = auth.role;

    // 2. Kiểm tra ID
    const postId = parseInt(params.id);
    if (isNaN(postId)) {
      throw new ApiError("ID bài viết không hợp lệ", 400);
    }

    // 3. Kiểm tra Bài viết tồn tại và Quyền sở hữu
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      throw new ApiError("Bài viết không tồn tại", 404);
    }

    await assertPostOwnership(post.authorId, authUserId, userRole);

    // 4. Thực hiện Xóa
    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({
      ok: true,
      message: "Bài viết đã được xóa thành công.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
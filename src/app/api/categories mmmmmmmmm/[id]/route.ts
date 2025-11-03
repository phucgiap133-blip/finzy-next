import { NextResponse } from "next/server";
import { assertAuth } from "@/lib/auth-middleware";
import { handleApiError, ApiError } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import { z } from "zod";
import slugify from "slugify";
import { Prisma } from "@prisma/client"; // ✅ import đúng cách

const CategoryUpdateSchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống").optional(),
});

type CategoryUpdatePayload = z.infer<typeof CategoryUpdateSchema>;

/**
 * @method PUT /api/categories/[id] - Cập nhật Danh mục (Yêu cầu ADMIN)
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = assertAuth(req);
    if (auth.role !== "ADMIN") {
      throw new ApiError("Chỉ ADMIN mới được cập nhật danh mục", 403);
    }

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      throw new ApiError("ID danh mục không hợp lệ", 400);
    }

    const json = await req.json();
    const validatedData = CategoryUpdateSchema.parse(json) as CategoryUpdatePayload;

    const updateData: Prisma.CategoryUpdateInput = { ...validatedData };

    if (validatedData.name) {
      const generatedSlug = slugify(validatedData.name, { lower: true, strict: true });

      const existingCategory = await prisma.category.findFirst({
        where: { slug: generatedSlug, NOT: { id: categoryId } },
      });

      if (existingCategory) {
        throw new ApiError("Slug danh mục mới đã tồn tại", 409);
      }

      updateData.slug = generatedSlug;
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
      select: { id: true, name: true, slug: true, updatedAt: true },
    });

    return NextResponse.json({
      ok: true,
      message: "Danh mục đã được cập nhật thành công.",
      category: updatedCategory,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return handleApiError(new ApiError("Danh mục không tồn tại", 404));
    }
    return handleApiError(error);
  }
}

/**
 * @method DELETE /api/categories/[id] - Xóa Danh mục (Yêu cầu ADMIN)
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = assertAuth(req);
    if (auth.role !== "ADMIN") {
      throw new ApiError("Chỉ ADMIN mới được xóa danh mục", 403);
    }

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      throw new ApiError("ID danh mục không hợp lệ", 400);
    }

    await prisma.category.delete({ where: { id: categoryId } });

    return NextResponse.json({
      ok: true,
      message: "Danh mục đã được xóa thành công.",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return handleApiError(new ApiError("Danh mục không tồn tại", 404));
    }
    return handleApiError(error);
  }
}

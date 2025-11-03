// src/app/api/categories/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";

import { assertAuth } from "@/lib/auth-middleware";
import { prisma } from "@/server/prisma";
import { ApiError, handleApiError, readJsonAndValidate } from "@/lib/utils";

// Validation
const CategorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống"),
});
type CategoryPayload = z.infer<typeof CategorySchema>;

/**
 * POST /api/categories
 * Tạo danh mục mới (chỉ ADMIN)
 */
export async function POST(req: Request) {
  try {
    const auth = assertAuth(req);
    if (auth.role !== "ADMIN") {
      throw new ApiError("Chỉ ADMIN mới được tạo danh mục", 403);
    }

    // Validate body
    const { name } = (await readJsonAndValidate(req, CategorySchema)) as CategoryPayload;

    // Tạo slug từ tên
    const generatedSlug = slugify(name, { lower: true, strict: true });

    // Kiểm tra xung đột name/slug
    const existed = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug: generatedSlug }] },
      select: { id: true },
    });
    if (existed) {
      throw new ApiError("Tên hoặc slug danh mục đã tồn tại", 409);
    }

    // Tạo danh mục
    const category = await prisma.category.create({
      data: { name, slug: generatedSlug },
      select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json(
      { ok: true, message: "Danh mục đã được tạo thành công.", category },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * GET /api/categories
 * Lấy danh sách danh mục (công khai)
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json({ ok: true, categories });
  } catch (err) {
    return handleApiError(err);
  }
}

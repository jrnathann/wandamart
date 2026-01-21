import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(req: Request) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;
  try {
    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
    }

    // Cloudinary destroy
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted from Cloudinary:", result);

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("Cloudinary deletion failed:", err);
    return NextResponse.json(
      { error: "Failed to delete image from Cloudinary", details: (err as Error).message },
      { status: 500 }
    );
  }
}

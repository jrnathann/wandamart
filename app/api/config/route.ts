import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { StoreConfig } from "@/models/SiteConfig";
import { requireAdmin } from "@/lib/requireAdmin";
export async function GET() {
  await connectDB();
  const config = await StoreConfig.findOne();
  // console.log("StoreConfig from DB:", JSON.stringify(config, null, 2))
  return NextResponse.json(config || {}, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
    },
  });
}

export async function POST(req: Request) {
  try {
    const adminCheck = await requireAdmin();
    await connectDB();
    const body = await req.json();
    // Logic: find existing config and update, or create new if empty
    const existingConfig = await StoreConfig.findOne();

    let updatedConfig;
    if (existingConfig) {
      updatedConfig = await StoreConfig.findByIdAndUpdate(
        existingConfig._id,
        body,
        { new: true }
      );
    } else {
      updatedConfig = await StoreConfig.create(body);
    }

    return NextResponse.json(updatedConfig);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}